const {
  getMessageList,
  validateGetMessageListData,
  checkUserExistsInChat,
} = require("../controllers/message");
const { ROUTE_PATHS } = require("../utils/constants");
const router = require("express").Router();

router.get(
  ROUTE_PATHS.LIST,
  validateGetMessageListData,
  checkUserExistsInChat,
  getMessageList
);

module.exports = router;
