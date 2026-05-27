const express = require("express");
const experienceVerificationController = require("../controllers/experienceVerification.controller");
const { authMiddleware, authorize, employerOnly, workerOnly } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router
  .route("/")
  .post(workerOnly, experienceVerificationController.addWorkExperience);

router.get("/worker/workplaces", workerOnly, experienceVerificationController.getWorkerEligibleWorkplaces);
router.get("/worker/me", workerOnly, experienceVerificationController.getMyWorkExperiences);
router.get("/worker/approved", workerOnly, experienceVerificationController.getApprovedWorkExperiences);
router.get("/employer/requests", employerOnly, experienceVerificationController.getEmployerVerificationRequests);

router
  .route("/:id")
  .get(authorize("worker", "employer"), experienceVerificationController.getVerificationById);

router.patch("/:id/status", employerOnly, experienceVerificationController.updateVerificationStatus);

module.exports = router;
