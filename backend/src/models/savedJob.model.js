const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

savedJobSchema.index({ workerId: 1, jobId: 1 }, { unique: true });
savedJobSchema.index({ workerId: 1, createdAt: -1 });

module.exports = mongoose.model("SavedJob", savedJobSchema);
