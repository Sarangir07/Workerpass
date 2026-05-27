const mongoose = require("mongoose");
const EmployerCompany = require("../models/employerCompany.model");
const EmployerWorker = require("../models/employerWorker.model");
const ExperienceVerification = require("../models/experienceVerification.model");
const JobApplication = require("../models/jobApplication.model");
const User = require("../models/user.model");

const allowedStatuses = ["Pending", "Approved", "Rejected"];

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ensureObjectId(value, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createError(`Invalid ${fieldName}`, 400);
  }
}

function normalizeDate(value, fieldName, { required = true } = {}) {
  if (!value) {
    if (required) {
      throw createError(`${fieldName} is required`, 400);
    }

    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError(`${fieldName} must be a valid date`, 400);
  }

  return date;
}

function cleanString(value) {
  return String(value || "").trim();
}

async function ensureEmployer(employerId) {
  ensureObjectId(employerId, "employerId");
  const employer = await User.findOne({ _id: employerId, userType: "employer" });

  if (!employer) {
    throw createError("Employer user not found", 404);
  }

  return employer;
}

function workplaceKey(employerId, companyName) {
  return `${String(employerId)}:${cleanString(companyName).toLowerCase()}`;
}

function addWorkplace(map, item) {
  if (!item?.employerId || !item?.companyName) {
    return;
  }

  const key = workplaceKey(item.employerId, item.companyName);
  const current = map.get(key);

  map.set(key, {
    employerId: item.employerId,
    companyId: item.companyId || current?.companyId || "",
    companyName: item.companyName,
    workRole: item.workRole || current?.workRole || "",
    source: current?.source ? `${current.source}, ${item.source}` : item.source,
    lastWorkedAt: item.lastWorkedAt || current?.lastWorkedAt || null
  });
}

async function getEligibleWorkplaces(workerId) {
  await ensureWorker(workerId);

  const [acceptedApplications, employerWorkers, approvedVerifications] = await Promise.all([
    JobApplication.find({ workerId, applicationStatus: "Accepted" })
      .populate({
        path: "jobId",
        populate: { path: "company" }
      })
      .sort({ updatedAt: -1 }),
    EmployerWorker.find({ worker: workerId })
      .populate("company")
      .sort({ updatedAt: -1 }),
    ExperienceVerification.find({ workerId, verificationStatus: "Approved" })
      .sort({ updatedAt: -1 })
  ]);

  const workplaces = new Map();
  const employerIds = new Set();

  acceptedApplications.forEach((application) => {
    const job = application.jobId;

    if (!job?.employer) return;
    employerIds.add(String(job.employer));
    addWorkplace(workplaces, {
      employerId: job.employer,
      companyId: job.company?._id || job.company || "",
      companyName: job.company?.companyName || job.companyName,
      workRole: job.title,
      source: "Accepted job",
      lastWorkedAt: application.updatedAt || application.applicationDate
    });
  });

  employerWorkers.forEach((workerLink) => {
    employerIds.add(String(workerLink.employer));
    addWorkplace(workplaces, {
      employerId: workerLink.employer,
      companyId: workerLink.company?._id || workerLink.company || "",
      companyName: workerLink.company?.companyName || "Connected employer",
      workRole: workerLink.role,
      source: "Employer worker record",
      lastWorkedAt: workerLink.updatedAt || workerLink.joiningDate
    });
  });

  approvedVerifications.forEach((verification) => {
    employerIds.add(String(verification.employerId));
    addWorkplace(workplaces, {
      employerId: verification.employerId,
      companyName: verification.companyName,
      workRole: verification.workRole,
      source: "Verified workplace",
      lastWorkedAt: verification.updatedAt
    });
  });

  const companies = await EmployerCompany.find({ employer: { $in: [...employerIds] } });
  const companyByEmployer = new Map(companies.map((company) => [String(company.employer), company]));

  return [...workplaces.values()]
    .map((workplace) => {
      const company = companyByEmployer.get(String(workplace.employerId));

      return {
        ...workplace,
        companyId: workplace.companyId || company?._id || "",
        companyName: workplace.companyName === "Connected employer" && company?.companyName
          ? company.companyName
          : workplace.companyName
      };
    })
    .sort((a, b) => new Date(b.lastWorkedAt || 0) - new Date(a.lastWorkedAt || 0));
}

async function ensureEligibleWorkplace(workerId, employerId, companyName) {
  const workplaces = await getEligibleWorkplaces(workerId);
  const isEligible = workplaces.some((workplace) => (
    String(workplace.employerId) === String(employerId)
    && cleanString(workplace.companyName).toLowerCase() === cleanString(companyName).toLowerCase()
  ));

  if (!isEligible) {
    throw createError("Select a workplace from your eligible workplace list", 403);
  }
}

async function ensureWorker(workerId) {
  ensureObjectId(workerId, "workerId");
  const worker = await User.findOne({ _id: workerId, userType: "worker" });

  if (!worker) {
    throw createError("Worker user not found", 404);
  }

  return worker;
}

function buildExperiencePayload(workerId, body) {
  const companyName = cleanString(body.companyName);
  const workRole = cleanString(body.workRole);
  const description = cleanString(body.description);
  const startDate = normalizeDate(body.startDate, "startDate");
  const endDate = normalizeDate(body.endDate, "endDate", { required: false });

  if (!companyName) {
    throw createError("companyName is required", 400);
  }

  if (!workRole) {
    throw createError("workRole is required", 400);
  }

  if (endDate && endDate < startDate) {
    throw createError("endDate cannot be before startDate", 400);
  }

  return {
    workerId,
    employerId: body.employerId,
    companyName,
    workRole,
    startDate,
    endDate,
    description,
    verificationStatus: "Pending"
  };
}

async function createExperienceVerification(workerId, body) {
  await ensureWorker(workerId);
  await ensureEmployer(body.employerId);

  const payload = buildExperiencePayload(workerId, body);
  await ensureEligibleWorkplace(workerId, payload.employerId, payload.companyName);
  const duplicateFilter = {
    workerId: payload.workerId,
    employerId: payload.employerId,
    companyName: payload.companyName,
    workRole: payload.workRole,
    startDate: payload.startDate,
    endDate: payload.endDate
  };

  const existingRequest = await ExperienceVerification.findOne(duplicateFilter);

  if (existingRequest) {
    throw createError("Verification request already exists for this work experience", 409);
  }

  return ExperienceVerification.create(payload);
}

function buildVerificationQuery({ user, status }) {
  const query = {};

  if (user.userType === "worker") {
    query.workerId = user._id;
  }

  if (user.userType === "employer") {
    query.employerId = user._id;
  }

  if (status) {
    if (!allowedStatuses.includes(status)) {
      throw createError(`verificationStatus must be one of: ${allowedStatuses.join(", ")}`, 400);
    }

    query.verificationStatus = status;
  }

  return query;
}

function populateVerification(query) {
  return query
    .populate("workerId", "name email userType")
    .populate("employerId", "name email userType");
}

async function listExperienceVerifications({ user, status }) {
  const query = buildVerificationQuery({ user, status });

  return populateVerification(
    ExperienceVerification.find(query)
      .sort({ createdAt: -1 })
  );
}

async function getExperienceVerificationById(id, user) {
  ensureObjectId(id, "verification id");
  const accessFilter = user.userType === "employer" ? { employerId: user._id } : { workerId: user._id };
  const verification = await populateVerification(ExperienceVerification.findOne({ _id: id, ...accessFilter }));

  if (!verification) {
    throw createError("Experience verification not found", 404);
  }

  return verification;
}

function buildEmployerUpdatePayload(body) {
  const verificationStatus = body.verificationStatus || body.status;

  if (!verificationStatus) {
    throw createError("verificationStatus is required", 400);
  }

  if (!allowedStatuses.includes(verificationStatus)) {
    throw createError(`verificationStatus must be one of: ${allowedStatuses.join(", ")}`, 400);
  }

  const payload = {
    verificationStatus,
    employerComments: cleanString(body.employerComments)
  };

  if (body.rating !== undefined && body.rating !== "") {
    const rating = Number(body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw createError("rating must be an integer from 1 to 5", 400);
    }

    payload.rating = rating;
  }

  payload.verifiedAt = verificationStatus === "Pending" ? null : new Date();

  return payload;
}

async function updateExperienceVerificationStatus(id, employerId, body) {
  ensureObjectId(id, "verification id");
  const payload = buildEmployerUpdatePayload(body);

  const verification = await ExperienceVerification.findOneAndUpdate(
    { _id: id, employerId },
    payload,
    { new: true, runValidators: true }
  );

  if (!verification) {
    throw createError("Experience verification not found", 404);
  }

  return populateVerification(ExperienceVerification.findById(verification._id));
}

async function updateExperienceVerificationByDetails(employerId, body) {
  const workerId = body.workerId;
  await ensureWorker(workerId);

  const filter = { employerId, workerId };

  if (body.verificationId) {
    ensureObjectId(body.verificationId, "verificationId");
    filter._id = body.verificationId;
  } else {
    if (body.companyName) filter.companyName = cleanString(body.companyName);
    if (body.workRole) filter.workRole = cleanString(body.workRole);
    if (body.startDate) filter.startDate = normalizeDate(body.startDate, "startDate");
    if (body.endDate) filter.endDate = normalizeDate(body.endDate, "endDate", { required: false });
  }

  const payload = buildEmployerUpdatePayload(body);
  const verification = await ExperienceVerification.findOneAndUpdate(filter, payload, {
    new: true,
    runValidators: true
  });

  if (!verification) {
    throw createError("Experience verification request not found", 404);
  }

  return populateVerification(ExperienceVerification.findById(verification._id));
}

module.exports = {
  createExperienceVerification,
  getEligibleWorkplaces,
  getExperienceVerificationById,
  listExperienceVerifications,
  updateExperienceVerificationByDetails,
  updateExperienceVerificationStatus
};
