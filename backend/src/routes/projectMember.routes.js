import express from "express";
import {
  assignEmployeeToProject,
  getProjectMembers,
  removeEmployeeFromProject,
  getProjectsOfEmployee
} from "../controllers/projectMember.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Project Members routes
router.post(
  "/projects/:projectId/members",
  authMiddleware,
  assignEmployeeToProject
);

router.get(
  "/projects/:projectId/members",
  authMiddleware,
  getProjectMembers
);

router.delete(
  "/projects/:projectId/members/:employeeId",
  authMiddleware,
  removeEmployeeFromProject
);

// Employee Projects route
router.get(
  "/employees/:employeeId/projects",
  authMiddleware,
  getProjectsOfEmployee
);

export default router;
