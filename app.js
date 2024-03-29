const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
require("dotenv").config();
const connectDB = require("./db/connect");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const { ROUTE_PATHS, SOCKET_EVENTS } = require("./utils/constants");
const { authenticateUser } = require("./controllers/utils");
const socketIO = require("socket.io");
const jwtDecode = require("jwt-decode");
const MessageStore = require("./models/messageStore");
const Chat = require("./models/chat");
const Message = require("./models/message");
const User = require("./models/user");
const app = express();
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.json());

// routes
app.use(ROUTE_PATHS.AUTH, authRoutes);
app.use(ROUTE_PATHS.CHAT, authenticateUser, chatRoutes);
app.use(ROUTE_PATHS.MESSAGE, authenticateUser, messageRoutes);
app.use(ROUTE_PATHS.USER, authenticateUser, userRoutes);
const port = process.env.PORT || 5000;
let server;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server = app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
    const io = socketIO(server, {
      cors: {
        origin: "*",
      },
    });
    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
      console.log("wow we are connected");
      socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (arg) => {
        const { chatID, text, authToken } = arg;
        if (!chatID || !text || !authToken) return;
        try {
          const user = await jwtDecode(authToken);
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
          // Marking this message as unread for members of group
          await (async () => {
            console.log(chat.members);
            for (let i = 0; i < chat.members.length; i++) {
              const reciever = await User.findOne({
                username: chat.members[i],
              });
              if (reciever._id.toString() !== user._id) {
                console.log(reciever);
                const chatListOfReciever = reciever.chatList;
                for (let j = 0; j < chatListOfReciever.length; j++) {
                  if (chatListOfReciever[j].id.toString() === chatID) {
                    chatListOfReciever[j] = {
                      ...chatListOfReciever[j],
                      unreadMessageCount:
                        chatListOfReciever[j].unreadMessageCount + 1,
                    };
                  }
                  await reciever.save();
                }
              }
            }
          })();
          // for reciever
          socket.broadcast.emit(SOCKET_EVENTS.RECIEVE_MESSAGE, {
            message,
            sender: {
              name: user?.name,
              username: user?.username,
            },
          });
          // for sender
          socket.emit(SOCKET_EVENTS.RECIEVE_MESSAGE, {
            message,
            sender: {
              name: user?.name,
              username: user?.username,
            },
          });
        } catch (e) {
          console.log("Something went wrong", e);
        }
      });

      socket.on(SOCKET_EVENTS.MARK_AS_READ, async (arg) => {
        const { chatID, authToken } = arg;
        if (!chatID || !authToken) return;
        try {
          const userDecoded = await jwtDecode(authToken);
          console.log(userDecoded);
          const user = await User.findOne({
            username: userDecoded.username,
          });
          const chatList = user.chatList;
          for (let i = 0; i < chatList.length; i++) {
            if (chatList[i].id.toString() === chatID) {
              chatList[i] = { ...chatList[i], unreadMessageCount: 0 };
              await user.save();
            }
          }
          const response = {
            personalChatMap: [],
            chatList: [],
          };
          const chatListIDs = user.chatList.map((chat) => chat.id.toString());
          response.chatList = await Chat.find({
            _id: { $in: [...chatListIDs] },
          });
          for (let i = 0; i < response.chatList.length; i++) {
            const { unreadMessageCount } = user.chatList.find(
              (val) => val.id.toString() === response.chatList[i]._id.toString()
            );
            let imageUrl = response.chatList[i].group_profile_pic;
            if (!response.chatList[i].isGroup) {
              const members = response.chatList[i].members;
              if (members[0] === user.username) {
                const member = await User.findOne({ username: members[1] });
                imageUrl = member.profile_img;
              } else {
                const member = await User.findOne({ username: members[0] });
                imageUrl = member.profile_img;
              }
            }
            response.chatList[i] = {
              ...response.chatList[i].toObject(),
              group_profile_pic: imageUrl,
              unreadMessageCount,
            };
          }
          response.chatList.sort(
            (a, b) => new Date(b.lastUpdatedTime) - new Date(a.lastUpdatedTime)
          );
          response.personalChatMap = [...user.personalChatMap];
          socket.emit(SOCKET_EVENTS.GET_CHAT_LIST, {
            ...response,
          });
        } catch (e) {
          console.log(e);
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};

start();
