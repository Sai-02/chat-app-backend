const User = require("../models/user");
const bcrypt = require("bcrypt");
const loginUser = (req, res, next) => {};

const createUser = async (req, res, next) => {
  const { name, password, phone_no, email, username } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      username,
      email,
      phone_no,
      salt,
      password: hashedPassword,
    });
    await user.save();
    return res.status(200).json({ user });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Something went wrong !!" });
  }
};

const validateUserSignUpData = (req, res, next) => {
  const { name, password, phone_no, email, username } = req.body;
  if (!name) return res.status(400).json({ msg: "Name is not present !!" });
  if (!password)
    return res.status(400).json({ msg: "Password is not present !!" });
  if (!phone_no)
    return res.status(400).json({ msg: "Phone no is not present !!" });
  if (!email) return res.status(400).json({ msg: "Email is not present !!" });
  if (!username)
    return res.status(400).json({ msg: "Username is not present !!" });
  next();
};

const checkUserExists = async (req, res, next) => {
  const { name, password, phone_no, email, username } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(403).json({ msg: "Email already exists !!" });
    user = await User.findOne({ username });
    if (user)
      return res.status(403).json({ msg: "Username already exists !!" });
    user = await User.findOne({ phone_no });
    if (user)
      return res.status(403).json({ msg: "Phone no already exists !!" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Something went wrong!!" });
  }
  next();
};
module.exports = {
  loginUser,
  createUser,
  validateUserSignUpData,
  checkUserExists,
};
