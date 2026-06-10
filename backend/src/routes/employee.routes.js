import express from "express";

import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from "../controllers/employee.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createEmployee
);

router.get(
  "/",
  authMiddleware,
  getEmployees
);

router.get(
  "/:id",
  authMiddleware,
  getEmployeeById
);

router.put(
  "/:id",
  authMiddleware,
  updateEmployee
);

router.delete(
  "/:id",
  authMiddleware,
  deleteEmployee
);

export default router;