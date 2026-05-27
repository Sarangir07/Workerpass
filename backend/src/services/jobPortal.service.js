const mongoose = require("mongoose");
const { JOB_STATUSES, JOB_TYPES } = require("../models/job.model");
const { APPLICATION_STATUSES } = require("../models/jobApplication.model");

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

function ensureObjectId(value, fieldName = "id") {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }

  return new mongoose.Types.ObjectId(value);
}

function buildJobFilter(query = {}) {
  const filter = {};
  const andFilters = [];

  if (query.search) {
    andFilters.push({
      $or: [
        { title: { $regex: query.search, $options: "i" } },
        { companyName: { $regex: query.search, $options: "i" } },
        { location: { $regex: query.search, $options: "i" } },
        { skillsRequired: { $regex: query.search, $options: "i" } }
      ]
    });
  }

  if (query.title) {
    filter.title = { $regex: query.title, $options: "i" };
  }

  if (query.companyName) {
    filter.companyName = { $regex: query.companyName, $options: "i" };
  }

  if (query.location) {
    filter.location = { $regex: query.location, $options: "i" };
  }

  if (query.skills) {
    filter.skillsRequired = { $in: parseList(query.skills).map((skill) => new RegExp(skill, "i")) };
  }

  if (query.jobType) {
    filter.jobType = query.jobType;
  }

  if (query.experience) {
    filter.experienceRequired = { $regex: query.experience, $options: "i" };
  }

  if (query.salary) {
    filter.salary = { $regex: query.salary, $options: "i" };
  }

  if (query.jobStatus) {
    filter.jobStatus = query.jobStatus;
  } else {
    filter.jobStatus = "open";
  }

  if (andFilters.length) {
    filter.$and = andFilters;
  }

  return filter;
}

function validateJobPayload(payload, { partial = false } = {}) {
  const requiredFields = [
    "title",
    "companyName",
    "salary",
    "location",
    "jobType",
    "experienceRequired",
    "description"
  ];

  if (!partial) {
    const missingFields = requiredFields.filter((field) => !payload[field]);

    if (missingFields.length) {
      const error = new Error(`${missingFields.join(", ")} required`);
      error.statusCode = 400;
      throw error;
    }
  }

  if (payload.jobType && !JOB_TYPES.includes(payload.jobType)) {
    const error = new Error(`jobType must be one of: ${JOB_TYPES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  if (payload.jobStatus && !JOB_STATUSES.includes(payload.jobStatus)) {
    const error = new Error(`jobStatus must be one of: ${JOB_STATUSES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
}

function validateApplicationStatus(status) {
  if (!APPLICATION_STATUSES.includes(status)) {
    const error = new Error(`applicationStatus must be one of: ${APPLICATION_STATUSES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
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
    url: `/uploads/job-applications/${file.filename}`
  };
}

module.exports = {
  buildJobFilter,
  ensureObjectId,
  filePayload,
  parseList,
  validateApplicationStatus,
  validateJobPayload
};
