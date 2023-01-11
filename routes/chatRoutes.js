const { validateCreateChatData, createChat } = require("../controllers/chat");
const { ROUTE_PATHS } = require("../utils/constants");

const router = require("express").Router();

router.post(ROUTE_PATHS.CREATE, validateCreateChatData, createChat);

module.exports = router;
