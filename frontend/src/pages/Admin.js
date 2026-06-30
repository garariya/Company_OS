import React, {  useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_URL } from "../config/api";

import DepartmentManagement from "../components/DepartmentManagement";
import EmployeeManagement from "../components/EmployeeManagement";
import ProjectManagement from "../components/ProjectManagement";
import TaskManagement from "../components/TaskManagement";
import ProjectTeamManagement from "../components/ProjectTeamManagement";
import DashboardCard from "../components/DashboardCard";

import TaskStatusChart from "../components/TaskStatusChart";
import ProjectProgressChart from "../components/ProjectProgressChart";
import EmployeeWorkloadChart from "../components/EmployeeWorkloadChart";
import DepartmentAnalytics from "../components/DepartmentAnalytics";

function Admin() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "dashboard";

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
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

      const res = await fetch(`${API_URL}/api/analytics/dashboard`, { headers });
      const data = await res.json();

      if (res.ok) {
        setAnalyticsData(data);
      } else {
        setError(data.message || "Unable to load analytics.");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard analytics", err);
      setError("Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  // KPI counts
  const stats = {
    departments: analyticsData?.departments || 0,
    employees: analyticsData?.employees || 0,
    projects: analyticsData?.projects || 0,
    tasks: analyticsData?.tasks || 0
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
    const emp = analyticsData?.employeeWorkload?.find(e => e.id === Number(selectedEmployeeId));
    filteredTodo = emp ? emp.todoTasks : 0;
    filteredInProgress = emp ? emp.inProgressTasks : 0;
    filteredDone = emp ? emp.doneTasks : 0;
  }

  // 2. Project Progress List
  let filteredProjects = analyticsData?.projectProgress || [];
  if (selectedProjectId) {
    filteredProjects = filteredProjects.filter(p => p.id === Number(selectedProjectId));
  }

  // 3. Employee Workload List
  let filteredWorkload = analyticsData?.employeeWorkload || [];
  if (selectedDepartmentId) {
    filteredWorkload = filteredWorkload.filter(e => e.departmentId === Number(selectedDepartmentId));
  }
  if (selectedEmployeeId) {
    filteredWorkload = filteredWorkload.filter(e => e.id === Number(selectedEmployeeId));
  }

  // 4. Department Analytics List
  let filteredDepartments = analyticsData?.departmentAnalytics || [];
  if (selectedDepartmentId) {
    filteredDepartments = filteredDepartments.filter(d => d.id === Number(selectedDepartmentId));
  }

  const handleResetFilters = () => {
    setSelectedProjectId("");
    setSelectedDepartmentId("");
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
      {/* Top KPI Cards (Always visible at the top) */}
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

      {currentView === "dashboard" && (
        <div style={{ marginBottom: "32px" }}>
          {/* Filters Bar */}
          <div className="management-form" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "16px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>Filter Analytics</span>
              {(selectedProjectId || selectedDepartmentId || selectedEmployeeId) && (
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
                    setSelectedEmployeeId(""); // mutually exclusive to prevent empty combinations
                  }}
                >
                  <option value="">All Projects</option>
                  {analyticsData?.projectProgress?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="department-filter">Department</label>
                <select
                  id="department-filter"
                  className="form-control"
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {analyticsData?.departmentAnalytics?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="employee-filter">Employee (Task Status)</label>
                <select
                  id="employee-filter"
                  className="form-control"
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setSelectedProjectId(""); // mutually exclusive
                  }}
                >
                  <option value="">All Employees</option>
                  {analyticsData?.employeeWorkload?.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Middle Layout: Task Status Chart */}
          <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
            <TaskStatusChart todo={filteredTodo} inProgress={filteredInProgress} done={filteredDone} />
          </div>

          {/* Bottom Layout: Project Progress, Workload, and Department Analytics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            <ProjectProgressChart projects={filteredProjects} />
            <EmployeeWorkloadChart workload={filteredWorkload} />
            <DepartmentAnalytics departments={filteredDepartments} />
          </div>
        </div>
      )}

      {/* Existing CRUD Views */}
      <div className="content-sections">
        {currentView === "departments" && (
          <section className="dashboard-section" id="departments-section">
            <DepartmentManagement />
          </section>
        )}

        {currentView === "employees" && (
          <section className="dashboard-section" id="employees-section">
            <EmployeeManagement />
          </section>
        )}

        {currentView === "projects" && (
          <section className="dashboard-section" id="projects-section">
            <ProjectManagement />
          </section>
        )}

        {currentView === "teams" && (
          <section className="dashboard-section" id="teams-section">
            <ProjectTeamManagement />
          </section>
        )}

        {currentView === "tasks" && (
          <section className="dashboard-section" id="tasks-section">
            <TaskManagement />
          </section>
        )}
      </div>
    </div>
  );
}

export default Admin;