const jwtDecode = require("jwt-decode");
const authenticateUser = async (req, res, next) => {
  const headers = req.headers;
  if (!headers.authorization)
    return res.status(401).json({ msg: "Unauthorized" });
  try {
    const token = headers.authorization.split(" ")[1];
    if (token) {
      const user = await jwtDecode(token);
      req.body.userID = user._id;
      next();
    } else return res.status(401).json({ msg: "Unauthorized" });
  } catch (e) {
    console.log(e);
    return res.status(401).json({ msg: "Unauthorized" });
  }
};

module.exports = {
  authenticateUser,
};
