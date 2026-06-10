import React from "react";

import MyTasks from "../components/MyTasks";
import MyProjects from "../components/MyProjects";
import EmployeeProfile from "../components/EmployeeProfile";

function Employee() {
  return (
    <div>
      <h1>Employee Dashboard</h1>

      <MyTasks />

      <MyProjects />

      <EmployeeProfile />
    </div>
  );
}

export default Employee;