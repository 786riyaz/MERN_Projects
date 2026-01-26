// /routes/serviceRoutes.js
const express = require("express");
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const router = express.Router();

router.get("/services", getServices);
router.post("/service", createService);
router.put("/service/:id", updateService);
router.delete("/service/:id", deleteService);

module.exports = router;
