const e = require("express");
const userService = require("../services/user.service");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.login(email, password);

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.create({ email, password });

    res.status(201).json({
      message: "User created successfully",
      userId: user.userId,
      token: user.token,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAll = async (_req, res) => {
  try {
    await userService.deleteAll();
    res.status(200).json({ message: "All users deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting users" });
  }
};

exports.createProfile = async (req, res) => {
  try {
    // Text fields come from req.body
    const { fullName = "", bio = "" } = req.body;

    // Uploaded files metadata
    // Each file has: destination, filename, path, mimetype, size, etc.
    // Build public URLs that match static mount (/uploads)
    const userId = req.user.userId;
    const files = (req.files || []).map((f) => ({
      originalName: f.originalname,
      fileName: f.filename,
      mimeType: f.mimetype,
      size: f.size,
      // Public URL based on static mount:
      url: `/uploads/${userId}/${f.filename}`,
      // Absolute path on disk if you need it:
      path: f.path,
    }));

    const profile = await userService.createProfile(userId, {
      fullName: fullName.trim(),
      bio: bio.trim(),
      pictures: files.map((f) => f.url), // store URLs in DB
    });

    res.status(200).json({ message: "Profile created", profile });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await userService.updateProfile(req.user.userId, req.body);
    res.status(200).json({ message: "Profile updated", profile });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await userService.getProfile(req.user.userId);
    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (_req, res) => {
  const users = await userService.getAll();
  res.json(users);
};

exports.findCandidates = async (req, res) => {
  const candidates = await userService.findCandidates(req.user);
  res.json(candidates);
};

exports.swipe = async (req, res) => {
  try {
    const { matched, matchDoc, error } = await userService.swipe(
      req.user,
      req.body
    );
    res.json({ ok: true, matched, matchId: matchDoc?._id || null });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.getMatches = async (req, res) => {
  const matches = await userService.getMatches(req.user.userId);
  res.json(matches);
};
