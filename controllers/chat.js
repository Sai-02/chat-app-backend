const Chat = require("../models/chat");
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
    const chat = new Chat({ isGroup, name, admins, members });
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
      user?.chatList?.push(id);
      await user.save();
    } catch (e) {
      console.log(e);
    }
  });
};

const deleteChat = async (req, res, next) => {
  return res.status(200).json({ msg: "We will work on it.." });
};

module.exports = {
  validateCreateChatData,
  createChat,
  deleteChat,
};
