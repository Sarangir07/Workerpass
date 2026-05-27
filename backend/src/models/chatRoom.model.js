const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployerCompany"
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatMessage"
    },
    lastMessageAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

chatRoomSchema.index({ worker: 1, employer: 1, job: 1 }, { unique: true });
chatRoomSchema.index({ application: 1 }, { unique: true, sparse: true });
chatRoomSchema.index({ participants: 1, lastMessageAt: -1 });

chatRoomSchema.pre("validate", function setParticipants(next) {
  if (this.worker && this.employer) {
    this.participants = [this.worker, this.employer];
  }

  next();
});

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
