const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklisttoken.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { set } = require("mongoose");
const { subscribeToQueue } = require("../../ride/services/rabbit");
const EventEmitter = require("events");
const rideEventEmitter = new EventEmitter();

module.exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await userModel.findOne({ email: email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token);

    delete newUser._doc.password;

    res
      .status(201)
      .json({ message: "User created successfully", newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token);

    delete user._doc.password;

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logoutUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(400)
        .json({ message: "No token found. User Alreay logged out" });
    }

    await blacklistTokenModel.create({ token });

    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.acceptedRides = async (req, res) => {
  rideEventEmitter.once("ride-accepted", (data) => {
    res.send(data);
  });

  setTimeout(() => {
    res.status(204).end();
  }, 30000);
};

subscribeToQueue("ride-accepted", async (msg) => {
  const rideData = JSON.parse(msg);
  rideEventEmitter.emit("ride-accepted", rideData);
});
