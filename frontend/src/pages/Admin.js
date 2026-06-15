import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import DepartmentManagement from "../components/DepartmentManagement";
import EmployeeManagement from "../components/EmployeeManagement";
import ProjectManagement from "../components/ProjectManagement";
import TaskManagement from "../components/TaskManagement";
import ProjectTeamManagement from "../components/ProjectTeamManagement";
import DashboardCard from "../components/DashboardCard";

function Admin() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "dashboard";

  const [stats, setStats] = useState({
    departments: 0,
    employees: 0,
    projects: 0,
    tasks: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all endpoint lists to calculate stats
      const [deptRes, empRes, projRes, taskRes] = await Promise.all([
        fetch("http://localhost:5001/api/departments", { headers }),
        fetch("http://localhost:5001/api/employees", { headers }),
        fetch("http://localhost:5001/api/projects", { headers }),
        fetch("http://localhost:5001/api/tasks", { headers })
      ]);

      const [deptData, empData, projData, taskData] = await Promise.all([
        deptRes.json(),
        empRes.json(),
        projRes.json(),
        taskRes.json()
      ]);

      setStats({
        departments: deptData.departments?.length || 0,
        employees: empData.employees?.length || 0,
        projects: projData.projects?.length || 0,
        tasks: taskData.tasks?.length || 0
      });

    } catch (error) {
      console.error("Failed to fetch dashboard statistics", error);
    }
  };

  return (
    <div>
      <div className="cards-grid">
        <DashboardCard
          title="Total Departments"
          value={stats.departments}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <DashboardCard
          title="Total Employees"
          value={stats.employees}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <DashboardCard
          title="Total Projects"
          value={stats.projects}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <DashboardCard
          title="Total Tasks"
          value={stats.tasks}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </div>

      <div className="content-sections">
        {(currentView === "dashboard" || currentView === "departments") && (
          <section className="dashboard-section" id="departments-section">
            <DepartmentManagement />
          </section>
        )}

        {(currentView === "dashboard" || currentView === "employees") && (
          <section className="dashboard-section" id="employees-section">
            <EmployeeManagement />
          </section>
        )}

        {(currentView === "dashboard" || currentView === "projects") && (
          <section className="dashboard-section" id="projects-section">
            <ProjectManagement />
          </section>
        )}

        {(currentView === "dashboard" || currentView === "teams") && (
          <section className="dashboard-section" id="teams-section">
            <ProjectTeamManagement />
          </section>
        )}

        {(currentView === "dashboard" || currentView === "tasks") && (
          <section className="dashboard-section" id="tasks-section">
            <TaskManagement />
          </section>
        )}
      </div>
    </div>
  );
}

export default Admin;