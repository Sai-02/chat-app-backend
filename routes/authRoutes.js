const {
  loginUser,
  createUser,
  validateUserSignUpData,
  checkUserExists,
  validateUserLoginData,
} = require("../controllers/auth");
const { ROUTE_PATHS } = require("../utils/constants");

const router = require("express").Router();

router.post(ROUTE_PATHS.LOGIN, validateUserLoginData, loginUser);
router.post(
  ROUTE_PATHS.SIGNUP,
  validateUserSignUpData,
  checkUserExists,
  createUser
);

module.exports = router;
