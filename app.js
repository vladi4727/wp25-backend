const express = require("express");
const app = express();
const connectDB = require("./db/db");
const path = require("node:path");
const provision = require("./provision/user.provision");
const fs = require("fs");

provision.provision();

connectDB();

app.use(express.json());

const uploadRoot = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/chats", require("./routes/chat.routes"));
app.use("/api/users", require("./routes/user.routes"));

// Serve Vue static files
const vueDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(vueDistPath));

// Catch-all SPA route
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(vueDistPath, "index.html"));
});

// global error handler middleware example
app.use(require("./middlewares/errorHandler"));

module.exports = app;
