const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
require("dotenv").config();
const connectDB = require("./db/connect");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { ROUTE_PATHS, SOCKET_EVENTS } = require("./utils/constants");
const { authenticateUser } = require("./controllers/utils");
const socketIO = require("socket.io");
const jwtDecode = require("jwt-decode");
const MessageStore = require("./models/messageStore");
const Chat = require("./models/chat");
const Message = require("./models/message");
const app = express();
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.json());

// routes
app.use(ROUTE_PATHS.AUTH, authRoutes);
app.use(ROUTE_PATHS.CHAT, authenticateUser, chatRoutes);
app.use(ROUTE_PATHS.MESSAGE, authenticateUser, messageRoutes);
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
    });
  } catch (error) {
    console.log(error);
  }
};

start();
