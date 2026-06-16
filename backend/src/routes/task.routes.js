import express from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from "../controllers/task.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createTask
);

router.get(
  "/",
  authMiddleware,
  getTasks
);

router.get(
  "/:id",
  authMiddleware,
  getTaskById
);

router.put(
  "/:id",
  authMiddleware,
  updateTask
);

router.patch(
  "/:id/status",
  authMiddleware,
  updateTaskStatus
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTask
);

export default router;