import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_URL } from "../config/api";

import MyProjects from "../components/MyProjects";
import MyTasks from "../components/MyTasks";
import DashboardCard from "../components/DashboardCard";

function Employee() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "dashboard";

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [selectedProjectId, setSelectedProjectId] = useState("");

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
      console.error("Failed to fetch employee analytics", err);
      setError("Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  // Derive stats with optional project filter
  let myProjects = analyticsData?.myProjects || 0;
  let myTasks = analyticsData?.myTasks || 0;
  let completedTasks = analyticsData?.completedTasks || 0;
  let pendingTasks = analyticsData?.pendingTasks || 0;
  let personalCompletionRate = analyticsData?.personalCompletionRate || 0;

  if (selectedProjectId) {
    const proj = analyticsData?.projectProgress?.find(p => p.id === Number(selectedProjectId));
    if (proj) {
      myTasks = proj.totalTasks;
      completedTasks = proj.doneTasks;
      pendingTasks = proj.todoTasks + proj.inProgressTasks;
      personalCompletionRate = proj.progressPercentage;
    } else {
      myTasks = 0;
      completedTasks = 0;
      pendingTasks = 0;
      personalCompletionRate = 0;
    }
  }

  // Radial Progress parameters
  const radius = 64;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (personalCompletionRate / 100) * circumference;

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
      {currentView === "dashboard" && (
        <div style={{ marginBottom: "32px" }}>
          {/* Project Filter */}
          <div className="management-form" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "16px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>Filter My Dashboard</span>
              {selectedProjectId && (
                <button className="btn" style={{ padding: "4px 8px", fontSize: "12px", color: "#EF4444", background: "rgba(239, 68, 68, 0.05)" }} onClick={() => setSelectedProjectId("")}>
                  Reset Filter
                </button>
              )}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="project-filter">Select Project</label>
              <select
                id="project-filter"
                className="form-control"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">All Assigned Projects</option>
                {analyticsData?.projectProgress?.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Top: My Projects & My Tasks */}
          <div className="cards-grid" style={{ marginBottom: "24px" }}>
            <DashboardCard
              title="My Projects"
              value={myProjects}
              icon={
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              }
            />
            <DashboardCard
              title="My Tasks"
              value={myTasks}
              icon={
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            />
          </div>

          {/* Middle: Completed & Pending Tasks */}
          <div className="cards-grid" style={{ marginBottom: "24px" }}>
            <DashboardCard
              title="Completed Tasks"
              value={completedTasks}
              icon={
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24" style={{ color: "#065F46" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <DashboardCard
              title="Pending Tasks"
              value={pendingTasks}
              icon={
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24" style={{ color: "#D97706" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Bottom: Personal Completion Percentage Gauge */}
          <div className="dashboard-section" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "24px", color: "var(--text-main)", textAlign: "center" }}>
              Personal Completion Percentage
            </h2>
            <div style={{ position: "relative", width: "160px", height: "160px" }}>
              <svg width="100%" height="100%" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
                {/* Background track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="var(--border-color)"
                  strokeWidth={strokeWidth}
                />
                {/* Active progress */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="var(--primary)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              {/* Percentage text */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-main)", lineHeight: 1 }}>
                  {personalCompletionRate}%
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px" }}>
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Specific CRUD Views */}
      <div className="content-sections">
        {currentView === "projects" && (
          <section className="dashboard-section">
            <MyProjects />
          </section>
        )}

        {currentView === "tasks" && (
          <section className="dashboard-section">
            <MyTasks />
          </section>
        )}
      </div>
    </div>
  );
}

export default Employee;