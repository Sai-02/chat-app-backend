// Model for message

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderID: {
    type: String,
    required: true,
  },
  recieverIDs: {
    type: Array,
    required: true,
  },
  chatID: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  time: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
