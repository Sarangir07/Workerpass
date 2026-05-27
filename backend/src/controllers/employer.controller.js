const mongoose = require("mongoose");
const EmployerCompany = require("../models/employerCompany.model");
const EmployerWorker = require("../models/employerWorker.model");
const Job = require("../models/job.model");
const User = require("../models/user.model");
const WorkerRating = require("../models/workerRating.model");
const { updateExperienceVerificationByDetails } = require("../services/experienceVerification.service");

function parseList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch (error) {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function filePayload(req, fieldName) {
  const file = req.files?.[fieldName]?.[0] || req.file;

  if (!file) {
    return undefined;
  }

  return {
    originalName: file.originalname,
    fileName: file.filename,
    path: file.path,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/employers/${file.filename}`
  };
}

function companyPayload(req) {
  const payload = {};
  const fields = ["companyName", "businessType", "ownerName", "email", "phone", "address", "description"];

  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      payload[field] = req.body[field];
    }
  });

  const companyLogo = filePayload(req, "companyLogo");

  if (companyLogo) {
    payload.companyLogo = companyLogo;
  }

  return payload;
}

async function getEmployerCompany(req) {
  return EmployerCompany.findOne({ employer: req.user._id });
}

async function createCompanyProfile(req, res, next) {
  try {
    const existingProfile = await getEmployerCompany(req);

    if (existingProfile) {
      return res.status(409).json({ message: "Employer company profile already exists" });
    }

    const company = await EmployerCompany.create({
      ...companyPayload(req),
      employer: req.user._id
    });

    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
}

async function updateCompanyProfile(req, res, next) {
  try {
    const company = await EmployerCompany.findOneAndUpdate(
      { employer: req.user._id },
      companyPayload(req),
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Employer company profile not found" });
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
}

async function getCompanyProfile(req, res, next) {
  try {
    const company = await getEmployerCompany(req);

    if (!company) {
      return res.status(404).json({ message: "Employer company profile not found" });
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
}

async function addWorker(req, res, next) {
  try {
    const { workerId, role, joiningDate, status } = req.body;

    if (!workerId || !role || !joiningDate) {
      return res.status(400).json({ message: "workerId, role, and joiningDate are required" });
    }

    const worker = await User.findOne({ _id: workerId, userType: "worker" });

    if (!worker) {
      return res.status(404).json({ message: "Worker user not found" });
    }

    const company = await getEmployerCompany(req);
    const employerWorker = await EmployerWorker.create({
      employer: req.user._id,
      company: company?._id,
      worker: workerId,
      role,
      joiningDate,
      status
    });

    res.status(201).json(employerWorker);
  } catch (error) {
    next(error);
  }
}

async function getCompanyWorkers(req, res, next) {
  try {
    const workers = await EmployerWorker.find({ employer: req.user._id })
      .populate("worker", "name email userType")
      .sort({ createdAt: -1 });

    res.json(workers);
  } catch (error) {
    next(error);
  }
}

async function verifyExperience(req, res, next) {
  try {
    const verification = await updateExperienceVerificationByDetails(req.user._id, req.body);
    res.json(verification);
  } catch (error) {
    next(error);
  }
}

async function createJob(req, res, next) {
  try {
    const company = await getEmployerCompany(req);
    const job = await Job.create({
      ...req.body,
      companyName: req.body.companyName || company?.companyName || "Company",
      skillsRequired: parseList(req.body.skillsRequired),
      employer: req.user._id,
      createdBy: req.user._id,
      company: company?._id
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
}

async function getEmployerJobs(req, res, next) {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

async function getJobById(req, res, next) {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
}

async function updateJob(req, res, next) {
  try {
    const payload = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(payload, "skillsRequired")) {
      payload.skillsRequired = parseList(payload.skillsRequired);
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, employer: req.user._id },
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
    const job = await Job.findOneAndDelete({ _id: req.params.id, employer: req.user._id });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function addWorkerRating(req, res, next) {
  try {
    const { workerId, rating, review } = req.body;

    if (!workerId || rating === undefined) {
      return res.status(400).json({ message: "workerId and rating are required" });
    }

    const worker = await User.findOne({ _id: workerId, userType: "worker" });

    if (!worker) {
      return res.status(404).json({ message: "Worker user not found" });
    }

    const workerRating = await WorkerRating.findOneAndUpdate(
      { employer: req.user._id, worker: workerId },
      { employer: req.user._id, worker: workerId, rating, review },
      { new: true, runValidators: true, upsert: true }
    );

    const ratingSummary = await getWorkerRatingSummary(workerId);

    res.status(201).json({
      rating: workerRating,
      averageRating: ratingSummary.averageRating,
      totalRatings: ratingSummary.totalRatings
    });
  } catch (error) {
    next(error);
  }
}

async function getWorkerRatings(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.workerId)) {
      return res.status(400).json({ message: "Invalid worker id" });
    }

    const ratings = await WorkerRating.find({ worker: req.params.workerId })
      .populate("employer", "name email userType")
      .sort({ createdAt: -1 });
    const ratingSummary = await getWorkerRatingSummary(req.params.workerId);

    res.json({
      ...ratingSummary,
      reviews: ratings
    });
  } catch (error) {
    next(error);
  }
}

async function getWorkerRatingSummary(workerId) {
  if (!mongoose.Types.ObjectId.isValid(workerId)) {
    return {
      averageRating: 0,
      totalRatings: 0
    };
  }

  const [summary] = await WorkerRating.aggregate([
    { $match: { worker: new mongoose.Types.ObjectId(workerId) } },
    {
      $group: {
        _id: "$worker",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  return {
    averageRating: summary ? Math.round(summary.averageRating * 10) / 10 : 0,
    totalRatings: summary?.totalRatings || 0
  };
}

module.exports = {
  createCompanyProfile,
  updateCompanyProfile,
  getCompanyProfile,
  addWorker,
  getCompanyWorkers,
  verifyExperience,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getJobById,
  addWorkerRating,
  getWorkerRatings
};
