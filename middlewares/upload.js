// src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Root upload folder
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

// Ensure root exists
if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

// destination based on user id (requires req.user set by auth middleware)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.userId?.toString?.() || "anonymous";
    const userDir = path.join(UPLOAD_ROOT, userId);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .slice(0, 40);
    const stamp = Date.now();
    cb(null, `${base || "img"}-${stamp}${ext}`);
  },
});

// Basic file filter: allow images only
const fileFilter = (req, file, cb) => {
  if (/^image\/(png|jpe?g|webp|gif|bmp|heic)$/i.test(file.mimetype))
    return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

// 5MB per file
const limits = { fileSize: 5 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

module.exports = { upload, UPLOAD_ROOT };
