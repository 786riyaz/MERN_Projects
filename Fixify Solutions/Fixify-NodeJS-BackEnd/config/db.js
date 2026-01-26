// config/db.js
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    console.log("Trying to connect MongoDB...");
    console.log("Mongo URI exists:", !!process.env.MONGODB_URI);
    console.log("Mongo URI prefix:", process.env.MONGODB_URI?.slice(0, 10));

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DatabaseName || "fixify",
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
    });

    isConnected = true;
    console.log("✓ MongoDB connected:", conn.connection.name);
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error.message);
    throw error; // handled upstream
  }
};

module.exports = connectDB;
