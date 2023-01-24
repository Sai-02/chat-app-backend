const Chat = require("../models/chat");
const MessageStore = require("../models/messageStore");

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
    
    return res.status(200).json({
      msg: "pahuch rha h",
      chat,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

// Controller for checking whether user exists in chat or not
const checkUserExistsInChat = async (req, res, next) => {
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

module.exports = {
  getMessageList,
  validateGetMessageListData,
  checkUserExistsInChat,
};
