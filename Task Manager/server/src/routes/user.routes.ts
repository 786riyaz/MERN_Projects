import { Router } from "express";
import { protect } from "../middleware/auth.middleware.ts";
import { adminOnly } from "../middleware/role.middleware.ts";
import { getAllUsers } from "../controllers/user.controller.ts";

const router = Router();

router.get("/users", protect, adminOnly, getAllUsers);

export default router;
