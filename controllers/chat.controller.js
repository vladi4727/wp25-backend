const {
  userInChat,
  listUserChats,
  listMessages,
  sendMessage,
} = require("../services/chat.service");
const Chat = require("../models/chat.model");

exports.getChats = async (req, res) => {
  const result = await Chat.find();
  res.json(result);
  return;
  try {
    const userId = req.user.userId;
    const chats = await listUserChats(userId);

    // Build response with "other user" info
    const result = [];
    for (const ch of chats) {
      const others = ch.participants.filter(
        (id) => String(id) !== String(userId)
      );
      const otherId = others[0];
      let other = null;
      if (otherId) {
        // Select minimal fields
        other = await User.findById(otherId, {
          "profile.fullName": 1,
          "profile.bio": 1,
          "profile.pictures": 1,
        });
      }
      result.push({
        _id: ch._id,
        matchId: ch.matchId,
        lastMessage: ch.lastMessage?.text,
        lastMessageAt: ch.lastMessage?.at,
        withUser: other
          ? {
              _id: other._id,
              fullName: other.profile?.fullName || "Unknown",
              bio: other.profile?.bio || "",
              picture: Array.isArray(other.profile?.pictures)
                ? other.profile.pictures
                : undefined,
            }
          : null,
      });
    }

    res.json(result);
  } catch (err) {
    console.error("GET /chats error", err);
    res.status(500).json({ message: "Failed to load chats" });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.userId;
    const auth = await userInChat(chatId, userId);
    if (!auth.ok) return res.status(auth.code).json({ message: auth.message });

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const before = req.query.before;
    const items = await listMessages(chatId, limit, before);
    res.json(items);
  } catch (err) {
    console.error("GET /chats/:id/messages error", err);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.userId;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: "Message too long" });
    }

    const auth = await userInChat(chatId, userId);
    if (!auth.ok) return res.status(auth.code).json({ message: auth.message });

    const msg = await sendMessage(chatId, userId, text.trim());

    // Optional: Socket.IO emit to the other participant
    if (req.io) {
      // assuming you attached io to req in app setup
      // notify both participants
      req.io.to(`chat:${chatId}`).emit("message", {
        _id: msg._id,
        chatId: msg.chatId,
        senderId: msg.senderId,
        text: msg.text,
        createdAt: msg.createdAt,
      });
    }

    res.status(201).json(msg);
  } catch (err) {
    console.error("POST /chats/:id/messages error", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
