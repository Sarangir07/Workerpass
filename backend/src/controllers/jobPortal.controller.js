const EmployerCompany = require("../models/employerCompany.model");
const Job = require("../models/job.model");
const JobApplication = require("../models/jobApplication.model");
const SavedJob = require("../models/savedJob.model");
const WorkerProfile = require("../models/workerProfile.model");
const { getOrCreateRoomForApplication } = require("../services/chat.service");
const { attachWorkerProfilesToApplications } = require("../services/workerJob.service");
const {
  buildJobFilter,
  ensureObjectId,
  filePayload,
  parseList,
  validateApplicationStatus,
  validateJobPayload
} = require("../services/jobPortal.service");

async function getEmployerCompanyName(employerId) {
  const company = await EmployerCompany.findOne({ employer: employerId });
  return company?.companyName;
}

async function createJob(req, res, next) {
  try {
    const payload = {
      ...req.body,
      companyName: req.body.companyName || (await getEmployerCompanyName(req.user._id)),
      skillsRequired: parseList(req.body.skillsRequired),
      employer: req.user._id,
      createdBy: req.user._id
    };

    validateJobPayload(payload);

    const job = await Job.create(payload);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
}

async function updateJob(req, res, next) {
  try {
    ensureObjectId(req.params.id, "job id");

    const payload = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(payload, "skillsRequired")) {
      payload.skillsRequired = parseList(payload.skillsRequired);
    }

    validateJobPayload(payload, { partial: true });

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      payload,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
}

async function deleteJob(req, res, next) {
  try {
    ensureObjectId(req.params.id, "job id");
    const job = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await Promise.all([
      JobApplication.deleteMany({ jobId: job._id }),
      SavedJob.deleteMany({ jobId: job._id })
    ]);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function getJobs(req, res, next) {
  try {
    const filter = buildJobFilter(req.query);
    const jobs = await Job.find(filter)
      .populate("createdBy", "name email userType")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

async function getJobById(req, res, next) {
  try {
    ensureObjectId(req.params.id, "job id");
    const job = await Job.findById(req.params.id).populate("createdBy", "name email userType");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
}

async function getEmployerJobs(req, res, next) {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

async function applyForJob(req, res, next) {
  try {
    ensureObjectId(req.params.jobId, "job id");

    const job = await Job.findOne({ _id: req.params.jobId, jobStatus: "open" });

    if (!job) {
      return res.status(404).json({ message: "Open job not found" });
    }

    const existingApplication = await JobApplication.findOne({
      workerId: req.user._id,
      jobId: job._id
    });

    if (existingApplication) {
      return res.status(409).json({ message: "You have already applied for this job" });
    }

    const workerProfile = await WorkerProfile.findOne({ user: req.user._id }).select("_id");

    const application = await JobApplication.create({
      workerId: req.user._id,
      jobId: job._id,
      workerProfile: workerProfile?._id,
      resume: filePayload(req, "resume"),
      coverLetter: req.body.coverLetter,
      applicationStatus: "Pending",
      applicationDate: new Date()
    });
    await getOrCreateRoomForApplication(application);

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
}

async function getMyApplications(req, res, next) {
  try {
    await attachWorkerProfilesToApplications({ workerId: req.user._id });
    const applications = await JobApplication.find({ workerId: req.user._id })
      .populate("jobId")
      .populate("workerProfile")
      .sort({ applicationDate: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
}

async function getJobApplications(req, res, next) {
  try {
    ensureObjectId(req.params.jobId, "job id");

    const job = await Job.findOne({ _id: req.params.jobId, createdBy: req.user._id });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await attachWorkerProfilesToApplications({ jobId: job._id });

    const applications = await JobApplication.find({ jobId: job._id })
      .populate("workerId", "name email userType")
      .populate("workerProfile")
      .sort({ applicationDate: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    ensureObjectId(req.params.applicationId, "application id");
    validateApplicationStatus(req.body.applicationStatus);

    const application = await JobApplication.findById(req.params.applicationId).populate("jobId");

    if (!application) {
      return res.status(404).json({ message: "Job application not found" });
    }

    if (String(application.jobId.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update applications for your jobs" });
    }

    application.applicationStatus = req.body.applicationStatus;
    await application.save();

    res.json(application);
  } catch (error) {
    next(error);
  }
}

async function saveJob(req, res, next) {
  try {
    ensureObjectId(req.params.jobId, "job id");
    const job = await Job.findOne({ _id: req.params.jobId, jobStatus: "open" });

    if (!job) {
      return res.status(404).json({ message: "Open job not found" });
    }

    const existingSavedJob = await SavedJob.findOne({
      workerId: req.user._id,
      jobId: job._id
    });

    if (existingSavedJob) {
      return res.status(409).json({ message: "Job already saved" });
    }

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

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  getJobs,
  getJobById,
  getEmployerJobs,
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  saveJob,
  removeSavedJob,
  getSavedJobs
};
