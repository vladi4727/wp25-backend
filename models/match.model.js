const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

// Match schema
const MatchSchema = new Schema({
  userIds: { type: [ObjectId], required: true }, // store sorted [min, max]
  createdAt: { type: Date, default: Date.now },
  lastMessageAt: Date,
});

const Match = model("Match", MatchSchema);
module.exports = Match;
