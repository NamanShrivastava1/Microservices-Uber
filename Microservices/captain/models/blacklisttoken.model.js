const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    blacklistedAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // Token expires after 1 hour
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("blacklistToken", blacklistTokenSchema);
