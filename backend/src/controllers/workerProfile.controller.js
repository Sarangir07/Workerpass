const WorkerProfile = require("../models/workerProfile.model");

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

function parseExperience(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function filePayload(req, fieldName) {
  const file = req.files?.[fieldName]?.[0];

  if (!file) {
    return undefined;
  }

  return {
    originalName: file.originalname,
    fileName: file.filename,
    path: file.path,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/worker-profiles/${file.filename}`
  };
}

function buildProfilePayload(req) {
  const payload = {};
  const scalarFields = [
    "fullName",
    "phone",
    "email",
    "dateOfBirth",
    "gender",
    "location",
    "jobCategory",
    "customJobTitle",
    "availabilityStatus",
    "bio"
  ];

  scalarFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      payload[field] = req.body[field];
    }
  });

  if (Object.prototype.hasOwnProperty.call(req.body, "skills")) {
    payload.skills = parseList(req.body.skills);
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "languages")) {
    payload.languages = parseList(req.body.languages);
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "experience")) {
    payload.experience = parseExperience(req.body.experience);
  }

  const profilePhoto = filePayload(req, "profilePhoto");
  const resume = filePayload(req, "resume");

  if (profilePhoto) {
    payload.profilePhoto = profilePhoto;
  }

  if (resume) {
    payload.resume = resume;
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === "") {
      delete payload[key];
    }
  });

  return payload;
}

async function createWorkerProfile(req, res, next) {
  try {
    const payload = buildProfilePayload(req);
    const existingProfile = await WorkerProfile.findOne({ user: req.user._id });

    if (existingProfile) {
      const workerProfile = await WorkerProfile.findOneAndUpdate(
        { user: req.user._id },
        payload,
        {
          new: true,
          runValidators: true
        }
      );

      return res.json(workerProfile);
    }

    const workerProfile = await WorkerProfile.create({
      ...payload,
      user: req.user._id
    });

    res.status(201).json(workerProfile);
  } catch (error) {
    next(error);
  }
}

async function getWorkerProfiles(req, res, next) {
  try {
    const { availabilityStatus, jobCategory, skill, language } = req.query;
    const filter = {};

    if (availabilityStatus) filter.availabilityStatus = availabilityStatus;
    if (jobCategory) filter.jobCategory = jobCategory;
    if (skill) filter.skills = { $in: [skill] };
    if (language) filter.languages = { $in: [language] };

    const workerProfiles = await WorkerProfile.find(filter)
      .populate("user", "name email userType")
      .sort({ createdAt: -1 });

    res.json(workerProfiles);
  } catch (error) {
    next(error);
  }
}

async function getMyWorkerProfile(req, res, next) {
  try {
    const workerProfile = await WorkerProfile.findOne({ user: req.user._id }).populate(
      "user",
      "name email userType"
    );

    if (!workerProfile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    res.json(workerProfile);
  } catch (error) {
    next(error);
  }
}

async function getWorkerProfileById(req, res, next) {
  try {
    const workerProfile = await WorkerProfile.findById(req.params.id).populate(
      "user",
      "name email userType"
    );

    if (!workerProfile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    res.json(workerProfile);
  } catch (error) {
    next(error);
  }
}

async function updateWorkerProfile(req, res, next) {
  try {
    const payload = buildProfilePayload(req);
    const filter =
      req.user.userType === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };

    const workerProfile = await WorkerProfile.findOneAndUpdate(filter, payload, {
      new: true,
      runValidators: true
    });

    if (!workerProfile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    res.json(workerProfile);
  } catch (error) {
    next(error);
  }
}

async function deleteWorkerProfile(req, res, next) {
  try {
    const filter =
      req.user.userType === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };

    const workerProfile = await WorkerProfile.findOneAndDelete(filter);

    if (!workerProfile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createWorkerProfile,
  getWorkerProfiles,
  getMyWorkerProfile,
  getWorkerProfileById,
  updateWorkerProfile,
  deleteWorkerProfile
};
