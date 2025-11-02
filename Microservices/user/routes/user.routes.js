const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", authMiddleware.userAuth, userController.getUserProfile);
router.get("/logout", userController.logoutUser);
router.get(
  "/accepted-rides",
  authMiddleware.userAuth,
  userController.acceptedRides
);

module.exports = router;
