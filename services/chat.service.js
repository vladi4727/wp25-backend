// services/chat.service.js
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const Match = require("../models/match.model");

async function userInChat(matchId, userId) {
  console.log(matchId, userId);
  const chat = await Chat.findOne({ matchId }, { participants: 1 });
  if (!chat) return { ok: false, code: 404, message: "Chat not found" };
  const allowed = chat.participants.some((id) => String(id) === String(userId));
  if (!allowed) return { ok: false, code: 403, message: "Forbidden" };
  return { ok: true, chat };
}

async function listUserChats(userId) {
  const chats = await Chat.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .lean();

  return chats;
}

async function listMessages(chatId, limit = 50, before) {
  const query = { chatId };
  if (before) query.createdAt = { $lt: new Date(before) };

  const items = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // return newest last (ascending) for UI convenience
  return items.reverse();
}

async function sendMessage(chatId, senderId, text) {
  const msg = await Message.create({ chatId, senderId, text });
  // Update chat lastMessage
  await Chat.findByIdAndUpdate(chatId, {
    $set: {
      lastMessage: { text, at: msg.createdAt, sender: senderId },
    },
  });
  return msg;
}

module.exports = {
  userInChat,
  listUserChats,
  listMessages,
  sendMessage,
};
