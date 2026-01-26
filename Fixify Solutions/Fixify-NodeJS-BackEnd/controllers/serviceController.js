// controllers/serviceController.js
const Service = require("../models/Service");

// GET ALL SERVICES
exports.getServices = async (req, res) => {
  const services = await Service.find().select("-__v");
  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
  });
};

// CREATE SERVICE
exports.createService = async (req, res) => {
  const newService = await Service.create({
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.status(201).json({ success: true, data: newService });
};

// UPDATE SERVICE
exports.updateService = async (req, res) => {
  const updated = await Service.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true }
  );

  res.status(200).json({ success: true, data: updated });
};

// DELETE SERVICE
exports.deleteService = async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Service removed" });
};
