const mongoose = require("mongoose");

const JOB_TYPES = ["full-time", "part-time", "contract", "temporary", "internship"];
const JOB_STATUSES = ["open", "closed", "draft"];

const jobSchema = new mongoose.Schema(
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    salary: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    jobType: {
      type: String,
      enum: JOB_TYPES,
      required: true
    },
    skillsRequired: {
      type: [String],
      default: []
    },
    experienceRequired: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    jobStatus: {
      type: String,
      enum: JOB_STATUSES,
      default: "open",
      index: true
    }
  },
  {
    timestamps: true
  }
);

jobSchema.index({ title: "text", companyName: "text", location: "text", skillsRequired: "text" });
jobSchema.index({ employer: 1, createdAt: -1 });
jobSchema.index({ jobType: 1, location: 1, experienceRequired: 1 });

module.exports = mongoose.model("Job", jobSchema);
module.exports.JOB_TYPES = JOB_TYPES;
module.exports.JOB_STATUSES = JOB_STATUSES;
