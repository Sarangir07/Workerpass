const express = require("express");
const jobPortalController = require("../controllers/jobPortal.controller");
const { authMiddleware, employerOnly, workerOnly } = require("../middlewares/auth.middleware");
const { uploadJobApplicationResume } = require("../middlewares/upload.middleware");

const router = express.Router();

router.use(authMiddleware);

router
  .route("/")
  .get(jobPortalController.getJobs)
  .post(employerOnly, jobPortalController.createJob);

router.get("/employer/my", employerOnly, jobPortalController.getEmployerJobs);
router.get("/saved/me", workerOnly, jobPortalController.getSavedJobs);
router.get("/applications/me", workerOnly, jobPortalController.getMyApplications);
router.patch("/applications/:applicationId/status", employerOnly, jobPortalController.updateApplicationStatus);

router
  .route("/:id")
  .get(jobPortalController.getJobById)
  .put(employerOnly, jobPortalController.updateJob)
  .delete(employerOnly, jobPortalController.deleteJob);

router.post("/:jobId/apply", workerOnly, uploadJobApplicationResume, jobPortalController.applyForJob);
router.get("/:jobId/applications", employerOnly, jobPortalController.getJobApplications);
router
  .route("/:jobId/save")
  .post(workerOnly, jobPortalController.saveJob)
  .delete(workerOnly, jobPortalController.removeSavedJob);

module.exports = router;
