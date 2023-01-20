// Model for chat room

const mongoose = require("mongoose");

const messageStoreSchema = new mongoose.Schema({
  messages: {
    type: Array,
    default: [],
  },
});

const MessageStore = mongoose.model("MessageStore", messageStoreSchema);
module.exports = MessageStore;
