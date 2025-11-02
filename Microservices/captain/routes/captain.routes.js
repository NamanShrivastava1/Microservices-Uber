const express = require("express");
const router = express.Router();
const captainController = require("../controllers/captain.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", captainController.registerCaptain);
router.post("/login", captainController.loginCaptain);
router.get(
  "/profile",
  authMiddleware.captainAuth,
  captainController.getCaptainProfile
);
router.get("/logout", captainController.logoutCaptain);
router.patch(
  "/update-availability",
  authMiddleware.captainAuth,
  captainController.updateCaptainStatus
);
router.get(
  "/new-ride",
  authMiddleware.captainAuth,
  captainController.waitForNewRides
);

module.exports = router;
