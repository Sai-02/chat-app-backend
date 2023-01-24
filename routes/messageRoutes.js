const {
  getMessageList,
  validateGetMessageListData,
  checkUserExistsInChatGET,
  checkUserExistsInChatPOST,
  validateSendMessageData,
  sendMessage,
} = require("../controllers/message");
const { ROUTE_PATHS } = require("../utils/constants");
const router = require("express").Router();

router.get(
  ROUTE_PATHS.LIST,
  validateGetMessageListData,
  checkUserExistsInChatGET,
  getMessageList
);

router.post(
  ROUTE_PATHS.SEND,
  validateSendMessageData,
  checkUserExistsInChatPOST,
  sendMessage
);

module.exports = router;
