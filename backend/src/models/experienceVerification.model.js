const mongoose = require("mongoose");

const VERIFICATION_STATUSES = ["Pending", "Approved", "Rejected"];

const experienceVerificationSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    workRole: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: "Pending"
    },
    employerComments: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    verifiedAt: Date
  },
  {
    timestamps: true
  }
);

experienceVerificationSchema.index(
  { workerId: 1, employerId: 1, companyName: 1, workRole: 1, startDate: 1, endDate: 1 },
  { unique: true }
);
experienceVerificationSchema.index({ employerId: 1, verificationStatus: 1, createdAt: -1 });
experienceVerificationSchema.index({ workerId: 1, verificationStatus: 1, createdAt: -1 });

module.exports = mongoose.model("ExperienceVerification", experienceVerificationSchema);
module.exports.VERIFICATION_STATUSES = VERIFICATION_STATUSES;
