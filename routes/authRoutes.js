const {
  loginUser,
  createUser,
  validateUserSignUpData,
  checkUserExists,
  validateUserLoginData,
} = require("../controllers/auth");
const { ROUTE_PATHS } = require("../utils/constants");

const router = require("express").Router();
const formidable = require("express-formidable");

router.post(ROUTE_PATHS.LOGIN, validateUserLoginData, loginUser);
router.post(
  ROUTE_PATHS.SIGNUP,
  formidable(),
  validateUserSignUpData,
  checkUserExists,
  createUser
);

module.exports = router;
