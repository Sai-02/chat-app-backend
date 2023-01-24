const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
require("dotenv").config();
const connectDB = require("./db/connect");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { ROUTE_PATHS } = require("./utils/constants");
const { authenticateUser } = require("./controllers/utils");
const app = express();
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.json());

// routes
app.use(ROUTE_PATHS.AUTH, authRoutes);
app.use(ROUTE_PATHS.CHAT, authenticateUser, chatRoutes);
app.use(ROUTE_PATHS.MESSAGE, authenticateUser, messageRoutes);
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
