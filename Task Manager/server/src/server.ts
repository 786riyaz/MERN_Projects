// server.ts
import express from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes.ts";
import taskRoutes from "./routes/task.routes.ts";
import userRoutes from "./routes/user.routes.ts";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);
app.use("/api", userRoutes);

/* =========================
   SOCKET.IO SETUP
========================= */
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", socket => {
  console.log("Socket connected:", socket.id);

  // User joins their own room (userId)
  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* =========================
   DATABASE + SERVER START
========================= */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  });
