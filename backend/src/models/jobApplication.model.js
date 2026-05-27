const mongoose = require("mongoose");

const APPLICATION_STATUSES = ["Pending", "Reviewed", "Accepted", "Rejected"];

const fileSchema = new mongoose.Schema(
  {
    originalName: String,
    fileName: String,
    path: String,
    mimeType: String,
    size: Number,
    url: String
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const jobApplicationSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    workerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerProfile"
    },
    resume: fileSchema,
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    applicationStatus: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Pending",
      index: true
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    applicationDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: "Pending", changedAt: new Date() }]
    }
  },
  {
    timestamps: true
  }
);

jobApplicationSchema.index({ workerId: 1, jobId: 1 }, { unique: true });
jobApplicationSchema.index({ jobId: 1, applicationStatus: 1 });
jobApplicationSchema.index({ workerId: 1, appliedAt: -1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
module.exports.APPLICATION_STATUSES = APPLICATION_STATUSES;
