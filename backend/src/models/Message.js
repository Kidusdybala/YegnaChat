import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: function() {
        return !this.file && !this.image && !this.audio;
      },
    },
    image: {
      type: String,
    },
    file: {
      type: String,
      fileName: String,
      fileSize: Number,
      fileType: String,
    },
    audio: {
      type: String,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

// Ensure we can efficiently query messages by chat
messageSchema.index({ chat: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;