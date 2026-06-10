import React from "react";

import TeamOverview from "../components/TeamOverview";
import ManagerProjects from "../components/ManagerProjects";
import ManagerTasks from "../components/ManagerTasks";

function Manager() {
  return (
    <div>
      <h1>Manager Dashboard</h1>

      <ManagerProjects />

      <TeamOverview />

      <ManagerTasks />
    </div>
  );
}

export default Manager;