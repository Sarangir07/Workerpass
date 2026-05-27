const mongoose = require("mongoose");

const workerRatingSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

workerRatingSchema.index({ employer: 1, worker: 1 }, { unique: true });

module.exports = mongoose.model("WorkerRating", workerRatingSchema);
