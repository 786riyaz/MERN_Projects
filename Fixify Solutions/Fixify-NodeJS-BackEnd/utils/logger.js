// utils/logger.js
const path = require("path");
const winston = require("winston");

const transports = [];

// Always log to console (works everywhere)
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

// Add file logging ONLY when not running on Vercel
if (!process.env.VERCEL) {
  const DailyRotateFile = require("winston-daily-rotate-file");

  const logDir = path.join(__dirname, "..", "logs");

  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: "%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "14d",
    })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

// For morgan integration
const stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = { logger, stream };
