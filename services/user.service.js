const User = require("../models/user.model");
const Swipe = require("../models/swipe.model");
const Match = require("../models/match.model");
const Chat = require("../models/chat.model");

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

async function login(email, password) {
  if (!email || !password) throw new Error("Email and password are required");

  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
  const hasProfile = !!user.profile.fullName;
  return { userId: user._id, token, hasProfile };
}

async function create(data) {
  // Check mandatory fields
  if (!data.email || !data.password)
    throw new Error("Email and password are required");

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    email: data.email,
    password: hashedPassword,
  });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
  return { userId: user._id, token };
}

async function createProfile(userId, profileData) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.profile = {
    fullName: profileData.fullName,
    bio: profileData.bio,
    pictures: profileData.pictures || [],
  };
  await user.save();
  return user.profile;
}

async function updateProfile(userId, profileData) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  return User.findByIdAndUpdate(
    userId,
    { profile: profileData },
    { new: true }
  );
}

async function getAll() {
  return User.find({});
}

async function findCandidates(user) {
  const userId = user.userId;
  // IDs already swiped by me
  const swipedIds = await Swipe.find({ swiperId: userId }).distinct("targetId");

  // IDs already matched with me
  const matchedPairs = await Match.find({ userIds: userId }, { userIds: 1 });
  const matchedIds = new Set();
  matchedPairs.forEach((m) => {
    m.userIds.forEach((id) => {
      if (String(id) !== String(userId)) matchedIds.add(String(id));
    });
  });

  const query = {
    _id: {
      $ne: userId,
      $nin: swipedIds,
      $nin: Array.from(matchedIds).map((id) => new mongoose.Types.ObjectId(id)),
    },
  };

  const candidates = (await User.find(query).limit(50)).map((user) => {
    return {
      userId: user._id,
      profile: user.profile,
    };
  });

  return candidates;
}

async function swipe(user, body) {
  const swiperId = user.userId;
  const { targetId, direction } = body;

  if (!["right", "left"].includes(direction)) {
    throw new Error("Invalid swipe direction");
  }
  if (String(swiperId) === String(targetId)) {
    throw new Error("Cannot swipe on yourself");
  }

  // Upsert (idempotent)
  await Swipe.updateOne(
    { swiperId, targetId },
    { $set: { direction }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );

  let matched = false;
  let matchDoc = null;

  if (direction === "right") {
    const theyLikedMe = await Swipe.findOne({
      swiperId: targetId,
      targetId: swiperId,
      direction: "right",
    });

    if (theyLikedMe) {
      const [a, b] = [String(swiperId), String(targetId)].sort();
      matchDoc = await Match.findOneAndUpdate(
        { userIds: [a, b] },
        { $setOnInsert: { userIds: [a, b], createdAt: new Date() } },
        { upsert: true, new: true }
      );

      // Create Chat if not existing
      await Chat.findOneAndUpdate(
        { matchId: matchDoc._id },
        { $setOnInsert: { matchId: matchDoc._id, participants: [a, b] } },
        { upsert: true, new: true }
      );

      matched = true;
      // Optional: emit real-time event to both users if using websockets
    }
  }

  return { matched, matchDoc };
}

async function getMatches(userId) {
  const matches = await Match.find({ userIds: userId });
  return matches;
}

async function deleteAll() {
  await User.deleteMany({});
  await Swipe.deleteMany({});
  await Match.deleteMany({});
}

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  return {
    userId: user._id,
    profile: user.profile,
  };
}

module.exports = {
  login,
  create,
  createProfile,
  updateProfile,
  getAll,
  findCandidates,
  swipe,
  getMatches,
  deleteAll,
  getProfile,
};
