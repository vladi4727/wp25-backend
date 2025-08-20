// routes/chat.routes.js
const express = require("express");
const router = express.Router();
const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const controller = require("../controllers/chat.controller");
const authenticateJWT = require("../middlewares/auth");

// GET /chats
router.get("/", authenticateJWT, controller.getChats);

// GET /chats/:id/messages?before=ISO&limit=50
router.get("/:id/messages", authenticateJWT, controller.getChatById);

// POST /chats/:id/messages
router.post("/:id/messages", authenticateJWT, controller.createMessage);

module.exports = router;
