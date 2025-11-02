const jwt = require("jsonwebtoken");
const axios = require("axios");

module.exports.userAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = req.cookies.token || (authHeader && authHeader.split(" ")[1]);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized. Invalid Token" });
    }

    const response = await axios.get(`http://localhost:3000/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = response.data?.user || response.data;
    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in User Middleware");
  }
};

module.exports.captainAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = req.cookies.token || (authHeader && authHeader.split(" ")[1]);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized. Invalid Token" });
    }

    const response = await axios.get(`http://localhost:3000/captain/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const captain = response.data?.captain || response.data;
    if (!captain || !captain._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Captain not found" });
    }

    req.captain = captain;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in Captain Middleware");
  }
};
