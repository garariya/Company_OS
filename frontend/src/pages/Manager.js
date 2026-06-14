import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getUser } from "../utils/auth";

import ManagerProjects from "../components/ManagerProjects";
import ManagerTasks from "../components/ManagerTasks";
import DashboardCard from "../components/DashboardCard";

function Manager() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "dashboard";
  const user = getUser() || { id: null };

  const [stats, setStats] = useState({
    managedProjects: 0,
    teamTasks: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch projects and tasks to calculate statistics
      const [projRes, taskRes] = await Promise.all([
        fetch("http://localhost:5001/api/projects", { headers }),
        fetch("http://localhost:5001/api/tasks", { headers })
      ]);

      const [projData, taskData] = await Promise.all([
        projRes.json(),
        taskRes.json()
      ]);

      const projects = projData.projects || [];
      const tasks = taskData.tasks || [];

      // Filter projects managed by the current manager
      const managedCount = projects.filter(p => p.createdBy?.id === user.id).length;

      setStats({
        managedProjects: managedCount,
        teamTasks: tasks.length
      });

    } catch (error) {
      console.error("Failed to fetch manager statistics", error);
    }
  };

  return (
    <div>
      <div className="cards-grid">
        <DashboardCard
          title="Managed Projects"
          value={stats.managedProjects}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <DashboardCard
          title="Team Tasks"
          value={stats.teamTasks}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </div>

      <div className="content-sections">
        {(currentView === "dashboard" || currentView === "projects") && (
          <section className="dashboard-section">
            <ManagerProjects />
          </section>
        )}

        {(currentView === "dashboard" || currentView === "tasks") && (
          <section className="dashboard-section">
            <ManagerTasks />
          </section>
        )}
      </div>
    </div>
  );
}

export default Manager;