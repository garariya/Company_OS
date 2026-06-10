import React from "react";

import DepartmentManagement from "../components/DepartmentManagement";
import EmployeeManagement from "../components/EmployeeManagement";
import ProjectManagement from "../components/ProjectManagement";
import TaskManagement from "../components/TaskManagement";

function Admin() {
  return (
    <div>
      <h1>Admin Dashboard</h1>

      <DepartmentManagement />

      <EmployeeManagement />

      <ProjectManagement />

      <TaskManagement />
    </div>
  );
}

export default Admin;