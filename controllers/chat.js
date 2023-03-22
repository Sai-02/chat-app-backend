const Chat = require("../models/chat");
const MessageStore = require("../models/messageStore");
const User = require("../models/user");

const validateCreateChatData = async (req, res, next) => {
  const headers = req.headers;
  if (!headers.authorization)
    return res.status(401).json({ msg: "Unauthorized" });
  const { isGroup, name, admins, members } = req.body;
  if (isGroup === undefined)
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
    await updateChatListOfMembers(members, chat._id);
    if (!isGroup) {
      await updatePersonalChatMap(members, chat._id.toString());
    }
    return res.status(200).json({ chat });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "Something went wrong!!" });
  }
};

const updatePersonalChatMap = async (members, chatID) => {
  try {
    const member1 = members[0];
    const member2 = members[1];
    const user1 = await User.findOne({
      username: member1,
    });
    const user2 = await User.findOne({
      username: member2,
    });
    user1.personalChatMap.push({
      username: member2,
      chatID,
    });
    user2.personalChatMap.push({
      username: member1,
      chatID,
    });
    await user1.save();
    await user2.save();
  } catch (e) {
    console.log(e);
  }
};

const updateChatListOfMembers = async (members, id) => {
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    try {
      let user = await User.findOne({ username: member });
      user?.chatList?.push({ id, unreadMessageCount: 0 });
      await user.save();
    } catch (e) {
      console.log(e);
    }
  }
};

const deleteChat = async (req, res, next) => {
  return res.status(200).json({ msg: "We will work on it.." });
};

const getChatList = async (req, res, next) => {
  const userID = req.body.userID;
  try {
    const user = await User.findOne({ _id: userID });
    const response = {
      personalChatMap: [],
      chatList: [],
    };
    const chatListIDs = user.chatList.map((chat) => chat.id.toString());
    response.chatList = await Chat.find({ _id: { $in: [...chatListIDs] } });
    for (let i = 0; i < response.chatList.length; i++) {
      const { unreadMessageCount } = user.chatList.find(
        (val) => val.id.toString() === response.chatList[i]._id.toString()
      );
      response.chatList[i] = {
        ...response.chatList[i].toObject(),
        unreadMessageCount,
      };
    }
    response.chatList.sort(
      (a, b) => new Date(b.lastUpdatedTime) - new Date(a.lastUpdatedTime)
    );
    response.personalChatMap = [...user.personalChatMap];
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
