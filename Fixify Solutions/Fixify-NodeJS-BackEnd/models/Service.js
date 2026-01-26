// models/Service.js
const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: String,
  description: String,
  basePrice: Number,
  category: String,
  iconUrl: String,
  createdAt: Date,
  updatedAt: Date,
});

module.exports = mongoose.model("Service", ServiceSchema);
