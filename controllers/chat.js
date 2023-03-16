const Chat = require("../models/chat");
const MessageStore = require("../models/messageStore");
const User = require("../models/user");

const validateCreateChatData = async (req, res, next) => {
  const headers = req.headers;
  if (!headers.authorization)
    return res.status(401).json({ msg: "Unauthorized" });
  const { isGroup, name, admins, members } = req.body;
  if (!isGroup)
    return res.status(400).json({ msg: `Missing parameter isGroup` });
  if (!name) return res.status(400).json({ msg: `Missing parameter name` });
  if (!admins) return res.status(400).json({ msg: "Missing parameter admins" });
  if (!members)
    return res.status(400).json({ msg: "Missing parameter members" });
  console.log(admins);
  next();
};

const createChat = async (req, res, next) => {
  const { isGroup, name, admins, members } = req.body;
  try {
    const messageStore = new MessageStore();
    await messageStore.save();
    const chat = new Chat({
      isGroup,
      name,
      admins,
      members,
      messageStoreID: messageStore._id,
    });
    await chat.save();
    console.log(chat);
    await updateChatListOfMembers(members, chat._id);
    return res.status(200).json({ chat });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "Something went wrong!!" });
  }
};

const updateChatListOfMembers = async (members, id) => {
  await members.map(async (member) => {
    try {
      let user = await User.findOne({ username: member });
      user?.chatList?.push({ id, unreadMessageCount: 0 });
      await user.save();
    } catch (e) {
      console.log(e);
    }
  });
};

const deleteChat = async (req, res, next) => {
  return res.status(200).json({ msg: "We will work on it.." });
};

const getChatList = async (req, res, next) => {
  const userID = req.body.userID;
  try {
    const user = await User.findOne({ _id: userID });
    const response = {
      size: 0,
      chats: [],
    };
    const chatListIDs = user.chatList.map((chat) => chat.id.toString());
    response.chats = await Chat.find({ _id: { $in: [...chatListIDs] } });
    for (let i = 0; i < response.chats.length; i++) {
      const { unreadMessageCount } = user.chatList.find(
        (val) => val.id.toString() === response.chats[i]._id.toString()
      );
      response.chats[i] = {
        ...response.chats[i].toObject(),
        unreadMessageCount,
      };
      response.size++;
    }
    response.chats.sort(
      (a, b) => new Date(b.lastUpdatedTime) - new Date(a.lastUpdatedTime)
    );
    return res.status(200).json({ ...response });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Something went wrong" });
  }
};

const validateMarkAllMessageRead = async (req, res, next) => {
  const { chatID } = req.body;
  if (!chatID)
    return res.status(400).json({ msg: "chatID is missing in request" });
  next();
};

const markAllMessageRead = async (req, res, next) => {
  const userID = req.body.userID;
  const chatID = req.body.chatID;

  try {
    const user = await User.findOne({ _id: userID });
    const chatList = user.chatList;
    for (let i = 0; i < chatList.length; i++) {
      if (chatList[i].id.toString() === chatID) {
        chatList[i] = { ...chatList[i], unreadMessageCount: 0 };
        await user.save();
        return res.status(200).json({ msg: "Success" });
      }
    }
    return res.status(400).json({ msg: "No Chat present with this id" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Something went wrong" });
  }
};

module.exports = {
  validateCreateChatData,
  createChat,
  deleteChat,
  getChatList,
  markAllMessageRead,
  validateMarkAllMessageRead,
};
