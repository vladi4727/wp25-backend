const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const swipeSchema = new Schema({
  swiperId: { type: ObjectId, index: true, required: true },
  targetId: { type: ObjectId, index: true, required: true },
  direction: { type: String, enum: ["right", "left"], required: true },
  createdAt: { type: Date, default: Date.now },
});
swipeSchema.index({ swiperId: 1, targetId: 1 }, { unique: true });

const Swipe = model("Swipe", swipeSchema);

module.exports = Swipe;
