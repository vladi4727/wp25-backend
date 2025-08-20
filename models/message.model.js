// models/message.model.js
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const MessageSchema = new Schema(
  {
    chatId: { type: Types.ObjectId, ref: "Chat", index: true, required: true },
    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    // Optional: attachments, read receipts, etc.
  },
  { timestamps: true }
);

MessageSchema.index({ chatId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", MessageSchema);
