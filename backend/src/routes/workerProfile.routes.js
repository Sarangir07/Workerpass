const express = require("express");
const workerProfileController = require("../controllers/workerProfile.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { uploadWorkerProfileFiles } = require("../middlewares/upload.middleware");

const router = express.Router();

router
  .route("/")
  .get(authenticate, authorize("employer", "admin"), workerProfileController.getWorkerProfiles)
  .post(
    authenticate,
    authorize("worker"),
    uploadWorkerProfileFiles,
    workerProfileController.createWorkerProfile
  );

router.get("/me", authenticate, authorize("worker"), workerProfileController.getMyWorkerProfile);

router
  .route("/:id")
  .get(authenticate, authorize("worker", "employer", "admin"), workerProfileController.getWorkerProfileById)
  .put(
    authenticate,
    authorize("worker", "admin"),
    uploadWorkerProfileFiles,
    workerProfileController.updateWorkerProfile
  )
  .delete(authenticate, authorize("worker", "admin"), workerProfileController.deleteWorkerProfile);

module.exports = router;
