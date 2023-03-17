const { getUsersList } = require("../controllers/user");
const { ROUTE_PATHS } = require("../utils/constants");
const router = require("express").Router();

router.get(ROUTE_PATHS.SEARCH, getUsersList);

module.exports = router;
