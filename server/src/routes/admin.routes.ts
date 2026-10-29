import { Router } from "express";
import { getUsers, updateStatus } from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(requireAuth, requireRole(["admin"]));
router.get("/users", getUsers).patch("/users/:id/status", updateStatus);
export default router;
