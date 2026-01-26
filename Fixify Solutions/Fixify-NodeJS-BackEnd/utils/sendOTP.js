// utils/sendOTP.js
const Otp = require("../models/Otp");
const generateOTP = require("./generateOTP");
const sendEmail = require("./sendEmail");

module.exports = async function sendOTP(email) {
  const otp = generateOTP();

  // Save OTP
  await Otp.create({ email, otp });

  // Send OTP via email
  await sendEmail(
    email,
    "Fixify Password Reset OTP",
    `Your OTP for password reset is: ${otp}. <BR>It is valid for 5 minutes.`
  );

  return otp;
};
