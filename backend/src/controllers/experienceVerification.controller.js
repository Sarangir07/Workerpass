const {
  createExperienceVerification,
  getEligibleWorkplaces,
  getExperienceVerificationById,
  listExperienceVerifications,
  updateExperienceVerificationStatus
} = require("../services/experienceVerification.service");

async function addWorkExperience(req, res, next) {
  try {
    const verification = await createExperienceVerification(req.user._id, req.body);
    res.status(201).json(verification);
  } catch (error) {
    next(error);
  }
}

async function getWorkerEligibleWorkplaces(req, res, next) {
  try {
    const workplaces = await getEligibleWorkplaces(req.user._id);
    res.json(workplaces);
  } catch (error) {
    next(error);
  }
}

async function getMyWorkExperiences(req, res, next) {
  try {
    const verifications = await listExperienceVerifications({
      user: req.user,
      status: req.query.verificationStatus || req.query.status
    });
    res.json(verifications);
  } catch (error) {
    next(error);
  }
}

async function getApprovedWorkExperiences(req, res, next) {
  try {
    const verifications = await listExperienceVerifications({
      user: req.user,
      status: "Approved"
    });
    res.json(verifications);
  } catch (error) {
    next(error);
  }
}

async function getEmployerVerificationRequests(req, res, next) {
  try {
    const verifications = await listExperienceVerifications({
      user: req.user,
      status: req.query.verificationStatus || req.query.status
    });
    res.json(verifications);
  } catch (error) {
    next(error);
  }
}

async function getVerificationById(req, res, next) {
  try {
    const verification = await getExperienceVerificationById(req.params.id, req.user);
    res.json(verification);
  } catch (error) {
    next(error);
  }
}

async function updateVerificationStatus(req, res, next) {
  try {
    const verification = await updateExperienceVerificationStatus(req.params.id, req.user._id, req.body);
    res.json(verification);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addWorkExperience,
  getApprovedWorkExperiences,
  getEmployerVerificationRequests,
  getWorkerEligibleWorkplaces,
  getMyWorkExperiences,
  getVerificationById,
  updateVerificationStatus
};
