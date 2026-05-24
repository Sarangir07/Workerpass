const express = require("express");
const workerPassController = require("../controllers/workerPass.controller");

const router = express.Router();

router
  .route("/")
  .get(workerPassController.getWorkerPasses)
  .post(workerPassController.createWorkerPass);

router
  .route("/:id")
  .get(workerPassController.getWorkerPassById)
  .put(workerPassController.updateWorkerPass)
  .delete(workerPassController.deleteWorkerPass);

module.exports = router;
