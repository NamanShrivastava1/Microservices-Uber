const captainModel = require("../models/captain.model");
const blacklistTokenModel = require("../models/blacklisttoken.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { subscribeToQueue, publishToQueue } = require("../services/rabbit");

const pendingRequests = [];

module.exports.registerCaptain = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const captain = await captainModel.findOne({ email: email });

    if (captain) {
      return res.status(400).json({ message: "Captain already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCaptain = await captainModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newCaptain._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token);

    delete newCaptain._doc.password;

    res
      .status(201)
      .json({ message: "Captain created successfully", newCaptain, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.loginCaptain = async (req, res) => {
  try {
    const { email, password } = req.body;
    const captain = await captainModel
      .findOne({ email: email })
      .select("+password");

    if (!captain) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const isPasswordValid = await bcrypt.compare(password, captain.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign({ id: captain._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token);

    delete captain._doc.password;

    res.status(200).json({ message: "Login successful", captain, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getCaptainProfile = async (req, res) => {
  try {
    const captain = req.captain;

    if (!captain) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Please log in first." });
    }

    res.status(200).json({
      message: "Captain profile fetched successfully",
      captain,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logoutCaptain = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(400)
        .json({ message: "No token found. Captain Alreay logged out" });
    }

    await blacklistTokenModel.create({ token });

    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.updateCaptainStatus = async (req, res) => {
  try {
    const captain = await captainModel.findById(req.captain._id);

    captain.isAvailable = !captain.isAvailable;

    await captain.save();
    res.send(captain);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.waitForNewRides = async (req, res) => {
  req.setTimeout(30000, () => {
    res.status(204).end();
  });

  pendingRequests.push(res);
};

subscribeToQueue("new-ride", (data) => {
  const rideData = JSON.parse(data);
  
  pendingRequests.forEach((res) => {
    res.json({ message: "New ride request", ride: rideData });
  });
  pendingRequests.length = 0;
});
