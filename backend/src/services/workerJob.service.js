const Job = require("../models/job.model");
const JobApplication = require("../models/jobApplication.model");
const SavedJob = require("../models/savedJob.model");
const WorkerProfile = require("../models/workerProfile.model");
const { ensureObjectId, filePayload, validateApplicationStatus } = require("./jobPortal.service");

async function findOpenJob(jobId) {
  ensureObjectId(jobId, "job id");

  const job = await Job.findOne({ _id: jobId, jobStatus: "open" });

  if (!job) {
    const error = new Error("Open job not found");
    error.statusCode = 404;
    throw error;
  }

  return job;
}

async function ensureNoApplication(workerId, jobId) {
  const existingApplication = await JobApplication.findOne({ workerId, jobId });

  if (existingApplication) {
    const error = new Error("You have already applied for this job");
    error.statusCode = 409;
    throw error;
  }
}

async function ensureNoSavedJob(workerId, jobId) {
  const existingSavedJob = await SavedJob.findOne({ workerId, jobId });

  if (existingSavedJob) {
    const error = new Error("Job already saved");
    error.statusCode = 409;
    throw error;
  }
}

async function attachWorkerProfilesToApplications(filter) {
  const applications = await JobApplication.find({
    ...filter,
    $or: [{ workerProfile: { $exists: false } }, { workerProfile: null }]
  }).select("_id workerId");

  if (!applications.length) {
    return;
  }

  const workerIds = [...new Set(applications.map((application) => String(application.workerId)))];
  const profiles = await WorkerProfile.find({ user: { $in: workerIds } }).select("_id user");
  const profileByUser = new Map(profiles.map((profile) => [String(profile.user), profile._id]));

  const updates = applications
    .map((application) => {
      const workerProfile = profileByUser.get(String(application.workerId));

      if (!workerProfile) {
        return null;
      }

      return {
        updateOne: {
          filter: { _id: application._id },
          update: { $set: { workerProfile } }
        }
      };
    })
    .filter(Boolean);

  if (updates.length) {
    await JobApplication.bulkWrite(updates);
  }
}

async function buildApplicationPayload(req, jobId) {
  const now = new Date();
  const workerProfile = await WorkerProfile.findOne({ user: req.user._id }).select("_id");

  return {
    workerId: req.user._id,
    jobId,
    workerProfile: workerProfile?._id,
    resume: filePayload(req, "resume"),
    coverLetter: req.body.coverLetter,
    applicationStatus: "Pending",
    appliedAt: now,
    applicationDate: now,
    statusHistory: [
      {
        status: "Pending",
        changedBy: req.user._id,
        changedAt: now
      }
    ]
  };
}

async function updateStatus(application, status, userId) {
  validateApplicationStatus(status);

  application.applicationStatus = status;
  application.statusHistory.push({
    status,
    changedBy: userId,
    changedAt: new Date()
  });

  await application.save();
  return application;
}

async function getWorkerJobStats(workerId) {
  await attachWorkerProfilesToApplications({ workerId });

  const [totalAppliedJobs, savedJobsCount, statusStats, recentApplications] = await Promise.all([
    JobApplication.countDocuments({ workerId }),
    SavedJob.countDocuments({ workerId }),
    JobApplication.aggregate([
      { $match: { workerId } },
      {
        $group: {
          _id: "$applicationStatus",
          count: { $sum: 1 }
        }
      }
    ]),
    JobApplication.find({ workerId })
      .populate("jobId")
      .populate("workerProfile")
      .sort({ appliedAt: -1 })
      .limit(5)
  ]);

  const applicationStatistics = {
    Pending: 0,
    Reviewed: 0,
    Accepted: 0,
    Rejected: 0
  };

  statusStats.forEach((item) => {
    applicationStatistics[item._id] = item.count;
  });

  return {
    totalAppliedJobs,
    savedJobsCount,
    recentApplications,
    applicationStatistics
  };
}

module.exports = {
  buildApplicationPayload,
  attachWorkerProfilesToApplications,
  ensureNoApplication,
  ensureNoSavedJob,
  findOpenJob,
  getWorkerJobStats,
  updateStatus
};
