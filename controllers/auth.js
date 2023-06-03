const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  newPipeline,
} = require("@azure/storage-blob");
require("dotenv").config();

const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY
);
const pipeline = newPipeline(sharedKeyCredential);
const getBlobName = (originalName) => {
  const identifier = Math.random().toString().replace(/0\./, "");
  return `${identifier}-${originalName}`;
};
const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  pipeline
);
const createUser = async (req, res, next) => {
  const { name, password, phone_no, email, username } = req.fields;
  const { image } = req.files;
  try {
    const blobName = getBlobName(username + "_" + image.name);
    const containerClient = blobServiceClient.getContainerClient("chat-app");
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadFile(image.path, image, {});
    const imageUrl = process.env.AZURE_STORED_IMAGE_URL + blobName;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      username,
      email,
      phone_no,
      salt,
      password: hashedPassword,
      profile_img: imageUrl,
    });
    await user.save();
    return res.status(200).json({ token: generateAuthToken(user) });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Something went wrong !!" });
  }
};

const loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ msg: "User doesn't exist !!" });
  const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect)
    return res.status(401).json({ msg: "Password is not correct !!" });
  return res.status(200).json({ token: generateAuthToken(user) });
};
const validateUserLoginData = (req, res, next) => {
  const { username, password } = req.body;
  if (!username)
    return res.status(400).json({ msg: "Username is not present !!" });
  if (!password)
    return res.status(400).json({ msg: "Password is not present !!" });
  next();
};

const validateUserSignUpData = (req, res, next) => {
  const { name, password, phone_no, email, username } = req.fields;
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
  const { name, password, phone_no, email, username } = req.fields;
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

const generateAuthToken = (user) => {
  const token = jwt.sign(user.toObject(), process.env.JWT_SECRET);
  return token;
};

module.exports = {
  loginUser,
  createUser,
  validateUserSignUpData,
  checkUserExists,
  validateUserLoginData,
};
