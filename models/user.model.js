const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  profile: {
    fullName: { type: String },
    bio: { type: String },
    pictures: [{ type: String }], // URLs or file paths
  },
  createdAt: { type: Date, default: Date.now },
});

const User = model("User", userSchema);

module.exports = User;
