const mongoose = require("mongoose");

const JOB_CATEGORIES = ["baker", "waiter", "cleaner", "cashier", "delivery_boy", "other"];
const AVAILABILITY_STATUSES = ["available", "busy", "not_available"];

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

const experienceSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    years: {
      type: Number,
      min: 0,
      default: 0
    },
    startDate: {
      type: String,
      trim: true
    },
    endDate: {
      type: String,
      trim: true
    },
    current: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const workerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    dateOfBirth: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    jobCategory: {
      type: String,
      enum: JOB_CATEGORIES,
      required: true
    },
    customJobTitle: {
      type: String,
      trim: true
    },
    skills: {
      type: [String],
      default: []
    },
    experience: {
      type: [experienceSchema],
      default: []
    },
    languages: {
      type: [String],
      default: []
    },
    profilePhoto: fileSchema,
    resume: fileSchema,
    availabilityStatus: {
      type: String,
      enum: AVAILABILITY_STATUSES,
      default: "available"
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("WorkerProfile", workerProfileSchema);
module.exports.JOB_CATEGORIES = JOB_CATEGORIES;
module.exports.AVAILABILITY_STATUSES = AVAILABILITY_STATUSES;
