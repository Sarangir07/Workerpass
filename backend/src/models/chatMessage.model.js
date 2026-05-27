const mongoose = require("mongoose");

const MESSAGE_TYPES = ["text"];

const chatMessageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    messageType: {
      type: String,
      enum: MESSAGE_TYPES,
      default: "text"
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

chatMessageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
module.exports.MESSAGE_TYPES = MESSAGE_TYPES;
