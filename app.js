const express = require("express");
const app = express();
const connectDB = require("./db/db");
const path = require("node:path");
const provision = require("./provision/user.provision");
const fs = require("fs");
// Simple CORS middleware
const corsMiddleware = (req, res, next) => {
  const origin = process.env.CORS_ORIGIN || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
};

provision.provision();

connectDB();

app.use(express.json());
app.use(corsMiddleware);

const uploadRoot = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });
app.use("/uploads", express.static(uploadRoot));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/chats", require("./routes/chat.routes"));
app.use("/api/users", require("./routes/user.routes"));

// Serve Vue static files
const vueDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(vueDistPath));

// Catch-all SPA route
app.use((req, res) => {
  res.sendFile(path.join(vueDistPath, "index.html"));
});

// global error handler middleware example
app.use(require("./middlewares/errorHandler"));

module.exports = app;
