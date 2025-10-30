const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

module.exports.userAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization").split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access Denied. No token provided." });
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
