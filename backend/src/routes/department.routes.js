import express from "express";

import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} from "../controllers/department.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createDepartment
);

router.get(
  "/",
  authMiddleware,
  getDepartments
);

router.get(
  "/:id",
  authMiddleware,
  getDepartmentById
);

router.put(
  "/:id",
  authMiddleware,
  updateDepartment
);

router.delete(
  "/:id",
  authMiddleware,
  deleteDepartment
);

export default router;