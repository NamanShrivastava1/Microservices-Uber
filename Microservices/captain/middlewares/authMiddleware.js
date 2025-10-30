const captainModel = require("../models/captain.model");
const blacklistTokenModel = require("../models/blacklisttoken.model");
const jwt = require("jsonwebtoken");

module.exports.captainAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = req.cookies.token || (authHeader && authHeader.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "Access Denied." });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Session expired. Please log in again." });
      } else {
        return res
          .status(401)
          .json({ message: "Invalid token. Please log in again." });
      }
    }
    const captain = await captainModel.findById(decoded.id);
    if (!captain) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.captain = captain;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
