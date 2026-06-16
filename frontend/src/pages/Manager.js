import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import ManagerProjects from "../components/ManagerProjects";
import ManagerTasks from "../components/ManagerTasks";
import DashboardCard from "../components/DashboardCard";

import TaskStatusChart from "../components/TaskStatusChart";
import ProjectProgressChart from "../components/ProjectProgressChart";

function Manager() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "dashboard";

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await fetch("http://localhost:5001/api/analytics/dashboard", { headers });
      const data = await res.json();

      if (res.ok) {
        setAnalyticsData(data);
      } else {
        setError(data.message || "Unable to load analytics.");
      }
    } catch (err) {
      console.error("Failed to fetch manager analytics", err);
      setError("Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  // KPI counts
  const stats = {
    managedProjects: analyticsData?.projectsManaged || 0,
    teamMembers: analyticsData?.teamMembers || 0,
    teamTasks: analyticsData?.teamTasks || 0
  };

  // FILTER LOGIC
  // 1. Task Status Chart counts
  let filteredTodo = analyticsData?.todoTasks || 0;
  let filteredInProgress = analyticsData?.inProgressTasks || 0;
  let filteredDone = analyticsData?.doneTasks || 0;

  if (selectedProjectId) {
    const proj = analyticsData?.projectProgress?.find(p => p.id === Number(selectedProjectId));
    filteredTodo = proj ? proj.todoTasks : 0;
    filteredInProgress = proj ? proj.inProgressTasks : 0;
    filteredDone = proj ? proj.doneTasks : 0;
  } else if (selectedEmployeeId) {
    const emp = analyticsData?.teamMembersWorkload?.find(e => e.id === Number(selectedEmployeeId));
    filteredTodo = emp ? emp.todoTasks : 0;
    filteredInProgress = emp ? emp.inProgressTasks : 0;
    filteredDone = emp ? emp.doneTasks : 0;
  }

  // 2. Project Progress List
  let filteredProjects = analyticsData?.projectProgress || [];
  if (selectedProjectId) {
    filteredProjects = filteredProjects.filter(p => p.id === Number(selectedProjectId));
  }

  const handleResetFilters = () => {
    setSelectedProjectId("");
    setSelectedEmployeeId("");
  };

  if (loading) {
    return (
      <div className="loading-indicator" style={{ minHeight: "300px" }}>
        <div className="spinner"></div>
        <span>Loading dashboard analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message-card" style={{
        padding: "24px",
        textAlign: "center",
        backgroundColor: "#FEF2F2",
        color: "#991B1B",
        borderRadius: "8px",
        margin: "24px 0",
        border: "1px solid #FCA5A5"
      }}>
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="48" height="48" style={{ margin: "0 auto 12px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 style={{ marginBottom: "8px" }}>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button className="btn btn-primary" style={{ marginTop: "16px" }} onClick={fetchAnalytics}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Top KPI/Summary Cards */}
      <div className="cards-grid">
        <DashboardCard
          title="Projects Managed"
          value={stats.managedProjects}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <DashboardCard
          title="Team Members"
          value={stats.teamMembers}
          icon={
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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

      {currentView === "dashboard" && (
        <div style={{ marginBottom: "32px" }}>
          {/* Filters Bar */}
          <div className="management-form" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "16px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>Filter Team Analytics</span>
              {(selectedProjectId || selectedEmployeeId) && (
                <button className="btn" style={{ padding: "4px 8px", fontSize: "12px", color: "#EF4444", background: "rgba(239, 68, 68, 0.05)" }} onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
            <div className="form-grid" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label htmlFor="project-filter">Project</label>
                <select
                  id="project-filter"
                  className="form-control"
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setSelectedEmployeeId(""); // mutually exclusive
                  }}
                >
                  <option value="">All Managed Projects</option>
                  {analyticsData?.projectProgress?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="employee-filter">Team Member (Task Status)</label>
                <select
                  id="employee-filter"
                  className="form-control"
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setSelectedProjectId(""); // mutually exclusive
                  }}
                >
                  <option value="">All Team Members</option>
                  {analyticsData?.teamMembersWorkload?.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Middle Layout: Team Task Status Chart */}
          <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
            <TaskStatusChart todo={filteredTodo} inProgress={filteredInProgress} done={filteredDone} />
          </div>

          {/* Bottom Layout: Project Progress */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
            <ProjectProgressChart projects={filteredProjects} />
          </div>
        </div>
      )}

      {/* Existing CRUD Views */}
      <div className="content-sections">
        {currentView === "projects" && (
          <section className="dashboard-section">
            <ManagerProjects />
          </section>
        )}

        {currentView === "tasks" && (
          <section className="dashboard-section">
            <ManagerTasks />
          </section>
        )}
      </div>
    </div>
  );
}

export default Manager;