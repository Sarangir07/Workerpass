const express = require("express");
const workerJobController = require("../controllers/workerJob.controller");
const { authMiddleware, employerOnly, workerOnly } = require("../middlewares/auth.middleware");
const { uploadJobApplicationResume } = require("../middlewares/upload.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/dashboard", workerOnly, workerJobController.getWorkerJobDashboard);
router.get("/saved", workerOnly, workerJobController.getSavedJobs);
router.get("/applied", workerOnly, workerJobController.getAppliedJobs);
router.get("/applied/:applicationId", workerOnly, workerJobController.getAppliedJobById);
router.get("/applications/:applicationId/history", workerOnly, workerJobController.getApplicationHistory);
router.patch("/applications/:applicationId/status", employerOnly, workerJobController.updateApplicationStatus);

router.post("/:jobId/apply", workerOnly, uploadJobApplicationResume, workerJobController.applyForJob);
router
  .route("/:jobId/save")
  .post(workerOnly, workerJobController.saveJob)
  .delete(workerOnly, workerJobController.removeSavedJob);

module.exports = router;
