// models/Otp.js
const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expireAt: {
    type: Date,
    default: () => Date.now() + 5 * 60 * 1000, // expires in 5 min
  },
});

// Auto delete expired OTPs
OtpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", OtpSchema);
