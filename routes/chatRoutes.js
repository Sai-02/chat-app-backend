const {
  validateCreateChatData,
  createChat,
  deleteChat,
  getChatList,
} = require("../controllers/chat");
const { ROUTE_PATHS } = require("../utils/constants");

const router = require("express").Router();

router.post(ROUTE_PATHS.CREATE, validateCreateChatData, createChat);

router.get(ROUTE_PATHS.LIST, getChatList);

router.delete(ROUTE_PATHS.DELETE, deleteChat);

module.exports = router;
