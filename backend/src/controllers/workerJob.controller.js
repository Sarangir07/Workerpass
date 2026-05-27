const Job = require("../models/job.model");
const JobApplication = require("../models/jobApplication.model");
const SavedJob = require("../models/savedJob.model");
const { getOrCreateRoomForApplication } = require("../services/chat.service");
const { ensureObjectId } = require("../services/jobPortal.service");
const {
  attachWorkerProfilesToApplications,
  buildApplicationPayload,
  ensureNoApplication,
  ensureNoSavedJob,
  findOpenJob,
  getWorkerJobStats,
  updateStatus
} = require("../services/workerJob.service");

async function applyForJob(req, res, next) {
  try {
    const job = await findOpenJob(req.params.jobId);
    await ensureNoApplication(req.user._id, job._id);

    const application = await JobApplication.create(await buildApplicationPayload(req, job._id));
    await getOrCreateRoomForApplication(application);

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
}

async function saveJob(req, res, next) {
  try {
    const job = await findOpenJob(req.params.jobId);
    await ensureNoSavedJob(req.user._id, job._id);

    const savedJob = await SavedJob.create({
      workerId: req.user._id,
      jobId: job._id
    });

    res.status(201).json(savedJob);
  } catch (error) {
    next(error);
  }
}

async function removeSavedJob(req, res, next) {
  try {
    ensureObjectId(req.params.jobId, "job id");

    const savedJob = await SavedJob.findOneAndDelete({
      workerId: req.user._id,
      jobId: req.params.jobId
    });

    if (!savedJob) {
      return res.status(404).json({ message: "Saved job not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function getSavedJobs(req, res, next) {
  try {
    const savedJobs = await SavedJob.find({ workerId: req.user._id })
      .populate("jobId")
      .sort({ createdAt: -1 });

    res.json(savedJobs);
  } catch (error) {
    next(error);
  }
}

async function getAppliedJobs(req, res, next) {
  try {
    await attachWorkerProfilesToApplications({ workerId: req.user._id });
    const applications = await JobApplication.find({ workerId: req.user._id })
      .populate("jobId")
      .populate("workerProfile")
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
}

async function getAppliedJobById(req, res, next) {
  try {
    ensureObjectId(req.params.applicationId, "application id");
    await attachWorkerProfilesToApplications({ _id: req.params.applicationId, workerId: req.user._id });

    const application = await JobApplication.findOne({
      _id: req.params.applicationId,
      workerId: req.user._id
    })
      .populate("jobId")
      .populate("workerProfile");

    if (!application) {
      return res.status(404).json({ message: "Applied job not found" });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
}

async function getApplicationHistory(req, res, next) {
  try {
    ensureObjectId(req.params.applicationId, "application id");

    const application = await JobApplication.findOne({
      _id: req.params.applicationId,
      workerId: req.user._id
    }).populate("statusHistory.changedBy", "name email userType");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({
      applicationId: application._id,
      applicationStatus: application.applicationStatus,
      appliedAt: application.appliedAt,
      statusHistory: application.statusHistory
    });
  } catch (error) {
    next(error);
  }
}

async function getWorkerJobDashboard(req, res, next) {
  try {
    const dashboard = await getWorkerJobStats(req.user._id);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    ensureObjectId(req.params.applicationId, "application id");

    const application = await JobApplication.findById(req.params.applicationId).populate("jobId");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const job = await Job.findOne({ _id: application.jobId._id, createdBy: req.user._id });

    if (!job) {
      return res.status(403).json({ message: "You can only update applications for your jobs" });
    }

    const updatedApplication = await updateStatus(application, req.body.applicationStatus, req.user._id);

    res.json(updatedApplication);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  applyForJob,
  saveJob,
  removeSavedJob,
  getSavedJobs,
  getAppliedJobs,
  getAppliedJobById,
  getApplicationHistory,
  getWorkerJobDashboard,
  updateApplicationStatus
};
