const Chat = require("../models/chat");
const Message = require("../models/message");
const MessageStore = require("../models/messageStore");
const User = require("../models/user");

//  Controller for getting message list
const getMessageList = async (req, res) => {
  const { chatID } = req.query;
  try {
    const chat = await Chat.findOne({
      _id: chatID,
    });
    const messageStoreID = chat?.messageStoreID;
    const messageStore = await MessageStore.findOne({
      _id: messageStoreID,
    });
    const messages = [];
    for (let i = 0; i < messageStore.messages.length; i++) {
      try {
        const message = await Message.findOne({
          _id: messageStore.messages[i],
        });
        const user = await User.findOne({
          _id: message.senderID,
        });
        messages.push({
          message,
          sender: {
            name: user?.name,
            username: user?.username,
          },
        });
      } catch (e) {
        console.log(e);
      }
    }

    return res.status(200).json({
      messages,
      size: messages.length,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

// Controller for checking whether user exists in chat or not
const checkUserExistsInChatGET = async (req, res, next) => {
  try {
    const { chatID } = req.query;
    const { user } = req.body;
    const chat = await Chat.findOne({ _id: chatID });
    if (!chat) return res.status(400).json({ msg: "Chat not found !" });
    if (!chat?.members?.includes(user.username))
      return res.status(401).json({ msg: "User does not exist on chat" });
    next();
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Something went wrong !", error: e });
  }
};

// Controller for validating body of the getMessageList controllers
const validateGetMessageListData = (req, res, next) => {
  const { chatID } = req.query;
  if (!chatID) return res.status(400).json({ msg: "chatID is missing !" });
  next();
};

// Middleware for checking if user exists in chat
const checkUserExistsInChatPOST = async (req, res, next) => {
  try {
    const { chatID, user } = req.body;
    const chat = await Chat.findOne({ _id: chatID });
    if (!chat) return res.status(400).json({ msg: "Chat not found !" });
    if (!chat?.members?.includes(user.username))
      return res.status(401).json({ msg: "User does not exist on chat" });
    next();
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Something went wrong !", error: e });
  }
};

// Controller for validating the body of sendMessage API
const validateSendMessageData = (req, res, next) => {
  const { chatID, text } = req.body;
  if (!chatID) return res.status(400).json({ msg: "chatID is missing" });
  if (!text)
    return res.status(400).json({
      msg: "Message text is missing",
    });
  next();
};

// Controller for sending the message
const sendMessage = async (req, res, next) => {
  const { chatID, text, user } = req.body;
  try {
    const chat = await Chat.findOne({
      _id: chatID,
    });
    const messageStore = await MessageStore.findOne({
      _id: chat?.messageStoreID,
    });
    const recieverIDs = chat?.members.filter(
      (member) => member !== user?.username
    );
    const message = new Message({
      text,
      senderID: user?._id,
      recieverIDs,
      chatID,
    });
    await message.save();
    messageStore?.messages.push(message?._id);
    await messageStore.save();
    chat.latestMessage = message.text;
    chat.lastUpdatedTime = Date.now();
    await chat.save();
    return res.status(200).json({
      msg: "Message Sent !!",
      message,
    });
  } catch (e) {
    return res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

module.exports = {
  getMessageList,
  validateGetMessageListData,
  checkUserExistsInChatGET,
  checkUserExistsInChatPOST,
  validateSendMessageData,
  sendMessage,
};
