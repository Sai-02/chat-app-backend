// Model for chat room

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  isGroup: {
    type: boolean,
    required: true,
  },
  admins: [{ _id }],
  latestMessage: {
    type: String,
  },
});
