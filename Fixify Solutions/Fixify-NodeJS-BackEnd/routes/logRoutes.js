// /routes/logRoutes.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const LOG_DIR = path.join(__dirname, "..", "logs");

// Get all log file names
router.get("/backend-logs", (req, res) => {
  try {
    const files = fs
      .readdirSync(LOG_DIR)
      .filter((f) => f.endsWith(".log") || f.endsWith(".logs"))
      .map((filename) => {
        const filePath = path.join(LOG_DIR, filename);
        const stats = fs.statSync(filePath);

        return {
          filename,
          size: (stats.size / 1024).toFixed(2) + " KB", // File size in KB
          createdAt: stats.birthtime, // File creation time
          updatedAt: stats.mtime, // Last modified time
        };
      });

    res.status(200).json({ success: true, files });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Cannot read log directory" });
  }
});

// Read the full content of a log file
router.get("/backend-logs/:filename", (req, res) => {
  try {
    const filePath = path.join(LOG_DIR, req.params.filename);

    if (!fs.existsSync(filePath))
      return res
        .status(404)
        .json({ success: false, message: "Log file not found" });

    const content = fs.readFileSync(filePath, "utf8");
    res.status(200).json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not read file" });
  }
});

// Download full log file
router.get("/backend-logs/:filename/download", (req, res) => {
  const filePath = path.join(LOG_DIR, req.params.filename);

  if (!fs.existsSync(filePath))
    return res
      .status(404)
      .json({ success: false, message: "Log file not found" });

  res.download(filePath);
});

// Get last N lines (default 50)
router.get("/backend-logs/:filename/last/:count", (req, res) => {
  try {
    const count = parseInt(req.params.count) || 50;
    const filePath = path.join(LOG_DIR, req.params.filename);

    if (!fs.existsSync(filePath))
      return res
        .status(404)
        .json({ success: false, message: "Log file not found" });

    const content = fs.readFileSync(filePath, "utf8").split("\n");
    const lastLines = content.slice(-count).join("\n");

    res.status(200).json({ success: true, count, content: lastLines });
  } catch (error) {
    res.status(500).json({ success: false, message: "Cannot read last lines" });
  }
});

// Download last N lines as file
router.get("/backend-logs/:filename/last/:count/download", (req, res) => {
  try {
    const count = parseInt(req.params.count) || 50;
    const filePath = path.join(LOG_DIR, req.params.filename);

    if (!fs.existsSync(filePath))
      return res
        .status(404)
        .json({ success: false, message: "Log file not found" });

    const content = fs.readFileSync(filePath, "utf8").split("\n");
    const lastLines = content.slice(-count).join("\n");

    const tempFile = path.join(LOG_DIR, `temp_${req.params.filename}`);
    fs.writeFileSync(tempFile, lastLines, "utf8");

    res.download(tempFile, (err) => {
      fs.unlinkSync(tempFile); // delete temp file after download
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error generating download" });
  }
});

module.exports = router;
