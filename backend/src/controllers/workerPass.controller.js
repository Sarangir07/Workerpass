const WorkerPass = require("../models/workerPass.model");

async function createWorkerPass(req, res, next) {
  try {
    const workerPass = await WorkerPass.create(req.body);
    res.status(201).json(workerPass);
  } catch (error) {
    next(error);
  }
}

async function getWorkerPasses(req, res, next) {
  try {
    const workerPasses = await WorkerPass.find().sort({ createdAt: -1 });
    res.json(workerPasses);
  } catch (error) {
    next(error);
  }
}

async function getWorkerPassById(req, res, next) {
  try {
    const workerPass = await WorkerPass.findById(req.params.id);

    if (!workerPass) {
      return res.status(404).json({ message: "Worker pass not found" });
    }

    res.json(workerPass);
  } catch (error) {
    next(error);
  }
}

async function updateWorkerPass(req, res, next) {
  try {
    const workerPass = await WorkerPass.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!workerPass) {
      return res.status(404).json({ message: "Worker pass not found" });
    }

    res.json(workerPass);
  } catch (error) {
    next(error);
  }
}

async function deleteWorkerPass(req, res, next) {
  try {
    const workerPass = await WorkerPass.findByIdAndDelete(req.params.id);

    if (!workerPass) {
      return res.status(404).json({ message: "Worker pass not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createWorkerPass,
  getWorkerPasses,
  getWorkerPassById,
  updateWorkerPass,
  deleteWorkerPass
};
