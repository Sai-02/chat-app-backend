const formidable = require("express-formidable");
const {
  validateCreateChatData,
  createChat,
  deleteChat,
  getChatList,
  validateMarkAllMessageRead,
  markAllMessageRead,
} = require("../controllers/chat");
const { ROUTE_PATHS } = require("../utils/constants");

const router = require("express").Router();

router.post(
  ROUTE_PATHS.CREATE,
  formidable(),
  validateCreateChatData,
  createChat
);

router.get(ROUTE_PATHS.LIST, getChatList);

router.delete(ROUTE_PATHS.DELETE, deleteChat);

router.post(
  ROUTE_PATHS.MARK_AS_READ,
  validateMarkAllMessageRead,
  markAllMessageRead
);

module.exports = router;
