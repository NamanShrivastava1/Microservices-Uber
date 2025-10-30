const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklisttoken.model");
const jwt = require("jsonwebtoken");

module.exports.userAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = req.cookies.token || (authHeader && authHeader.split(" ")[1]);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access Denied." });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
