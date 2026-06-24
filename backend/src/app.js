import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import projectMemberRoutes from "./routes/projectMember.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import notificationRoutes from "./routes/notification.routes.js";


const app = express();

app.use(cors());

app.use(express.json());

app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/departments",
  departmentRoutes
)

app.use(
  "/api/employees",
  employeeRoutes
)

app.use(
  "/api/projects",
  projectRoutes
)

app.use(
  "/api/tasks",
  taskRoutes
)

app.use(
  "/api/analytics",
  analyticsRoutes
)

app.use(
  "/api/notifications",
  notificationRoutes
)

app.use(
  "/api",
  projectMemberRoutes
)
export default app;