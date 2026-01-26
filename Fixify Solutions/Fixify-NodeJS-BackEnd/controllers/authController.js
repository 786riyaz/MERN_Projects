// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const sendOTP = require("../utils/sendOTP");

// Default avatar URLs
// const FEMALE_AVATAR = "http://localhost:5000/uploads/Profile_Pictures_1_F.jpg";
// const MALE_AVATAR = "http://localhost:5000/uploads/Profile_Pictures_1_M.jpg";

const FEMALE_AVATAR = "/uploads/Profile_Pictures_1_F.jpg";
const MALE_AVATAR   = "/uploads/Profile_Pictures_1_M.jpg";

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      avatarUrl,
      addresses,
      gender
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "firstName, lastName, email, phone and password are required",
      });
    }

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: "Email already registered" });

    if (await User.findOne({ phone }))
      return res.status(400).json({ success: false, message: "Phone already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    // Determine default avatar based on gender
    let finalAvatar = avatarUrl || null;

    if (!finalAvatar && gender) {
      if (gender === "female") finalAvatar = FEMALE_AVATAR;
      if (gender === "male") finalAvatar = MALE_AVATAR;
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      gender: gender || null,
      role: role || "customer",
      avatarUrl: finalAvatar,
      addresses: Array.isArray(addresses) ? addresses : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET PROFILE (via token)
exports.getProfile = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// SEND OTP FOR FORGOT PASSWORD
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    await sendOTP(email);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email, otp });
    if (!record)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    res.status(200).json({ success: true, message: "OTP Verified" });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await Otp.findOne({ email, otp });
    if (!record)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ email }, { passwordHash: hashed });

    await Otp.deleteMany({ email }); // delete used OTP

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    next(error);
  }
};
