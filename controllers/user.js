const User = require("../models/user");
const getUsersList = async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ msg: "username is required" });
  try {
    const users = await User.find({
      username: {
        $regex: `${username}`,
        $options: "i",
      },
    });
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      users[i] = {
        name: user.name,
        username: user.username,
        email: user.email,
        profile_img: user.profile_img,
      };
    }
    return res.status(200).json({
      users: [...users],
    });
  } catch (e) {
    return res.status(500).json({ msg: "Something went wrong" });
  }
};

module.exports = {
  getUsersList,
};
