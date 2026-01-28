import { Router } from "express";
import { protect } from "../middleware/auth.middleware.ts";
import { adminOnly } from "../middleware/role.middleware.ts";
import {
  createTask,
  getTasks,
  updateTaskStatus
} from "../controllers/task.controller.ts";

const router = Router();

router.post("/tasks", protect, adminOnly, createTask);
router.get("/tasks", protect, getTasks);
router.patch("/tasks/:id/status", protect, updateTaskStatus);

export default router;
