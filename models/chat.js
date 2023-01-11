// Model for chat room

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  isGroup: {
    type: Boolean,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  admins: {
    type: Array,
    required: true,
  },
  latestMessage: {
    type: String,
    default: "",
  },
  members: {
    type: Array,
    required: true,
  },
  messages: {
    type: Array,
    default: [],
  },
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
