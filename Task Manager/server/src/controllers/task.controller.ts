import { Response } from "express";
import Task from "../models/Task.ts";
import { AuthRequest } from "../middleware/auth.middleware.ts";
import { io } from "../server.ts";

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignedTo } = req.body;

    if (!title || !description || !assignedTo) {
      return res
        .status(400)
        .json({ message: "Title, description and assignedTo required" });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      createdBy: req.user!.id
    });

    io.to(assignedTo).emit("task:assigned", {
      message: "New task assigned",
      task
    });

    return res.status(201).json(task);
  } catch {
    return res.status(500).json({ message: "Failed to create task" });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const filter =
      req.user!.role === "admin"
        ? {}
        : { assignedTo: req.user!.id };

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "username")
      .populate("createdBy", "username");

    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    if (!["todo", "in-progress", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedTo.toString() !== req.user!.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch {
    res.status(500).json({ message: "Failed to update status" });
  }
};
