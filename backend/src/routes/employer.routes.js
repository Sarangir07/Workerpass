const express = require("express");
const employerController = require("../controllers/employer.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { uploadCompanyLogo } = require("../middlewares/upload.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorize("employer"));

router
  .route("/company-profile")
  .get(employerController.getCompanyProfile)
  .post(uploadCompanyLogo, employerController.createCompanyProfile)
  .put(uploadCompanyLogo, employerController.updateCompanyProfile);

router
  .route("/workers")
  .get(employerController.getCompanyWorkers)
  .post(employerController.addWorker);

router.post("/experience-verifications", employerController.verifyExperience);

router
  .route("/jobs")
  .get(employerController.getEmployerJobs)
  .post(employerController.createJob);

router
  .route("/jobs/:id")
  .get(employerController.getJobById)
  .put(employerController.updateJob)
  .delete(employerController.deleteJob);

router.post("/ratings", employerController.addWorkerRating);
router.get("/ratings/:workerId", employerController.getWorkerRatings);

module.exports = router;
