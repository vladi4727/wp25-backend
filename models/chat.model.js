// models/chat.model.js
const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const ChatSchema = new Schema(
  {
    matchId: {
      type: Types.ObjectId,
      ref: "Match",
      index: true,
      unique: true,
      required: true,
    },
    participants: [{ type: Types.ObjectId, ref: "User", required: true }], // [u1, u2]
    lastMessage: {
      text: { type: String },
      at: { type: Date },
      sender: { type: Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

const Chat = model("Chat", ChatSchema);
module.exports = Chat;
