const mongoose = require("mongoose");

const WORKER_STATUSES = ["active", "inactive", "left"];

const employerWorkerSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployerCompany"
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    joiningDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: WORKER_STATUSES,
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

employerWorkerSchema.index({ employer: 1, worker: 1 }, { unique: true });

module.exports = mongoose.model("EmployerWorker", employerWorkerSchema);
module.exports.WORKER_STATUSES = WORKER_STATUSES;
