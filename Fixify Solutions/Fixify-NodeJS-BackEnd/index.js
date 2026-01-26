// index.js
// Load Environment Variables
require("dotenv").config();

// Core Modules & Packages
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// Swagger (loaded conditionally)
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

// Internal Imports
const connectDB = require("./config/db");
const { stream } = require("./utils/logger");

const logRoutes = require("./routes/logRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

// App Initialization
const app = express();

// Static files
app.use("/uploads", express.static("public/uploads"));

// Database Connection
connectDB().catch((err) => {
  console.error("Initial DB connection error:", err.message);
});

// CORS
const allowedOrigins = JSON.parse(process.env.Allowed_Origins || "[]");

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server, Postman, curl
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Not Allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
};

app.use(cors(corsOptions)); // ✅ KEEP THIS
// ❌ REMOVE app.options(...)

// Body parser
app.use(express.json());

// Logging Middleware
app.use(morgan("combined", { stream }));

// ✅ Swagger – ENABLE ONLY LOCALLY
if (!process.env.VERCEL) {
  const swaggerPath = path.resolve(__dirname, "swagger", "swagger.yaml");
  const swaggerDocument = YAML.load(swaggerPath);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/services", serviceRoutes);
app.use("/bookings", bookingRoutes);   // ✔ CORRECT PREFIX (no /api)

// Log Routes
app.use("/logs", logRoutes);

// Health Check / Default Route
app.get("/", (req, res) => {
  res.send("Field Service Management API is Running...");
});

// Error Handler
app.use(errorMiddleware);

// Start Server (local only – Vercel ignores this)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Server running...`);
});
