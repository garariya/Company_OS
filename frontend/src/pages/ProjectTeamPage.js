import React, { useState, useEffect } from "react";
import { getUser, getToken } from "../utils/auth";
import { API_URL } from "../config/api";

function ProjectTeamPage() {
  const user = getUser() || { role: "EMPLOYEE", id: null };
  const token = getToken();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [projectsLoading, setProjectsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    fetchDropdownProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId);
      fetchProjectMembers(selectedProjectId);
    } else {
      setProjectDetails(null);
      setMembers([]);
    }
  }, [selectedProjectId]);

  const fetchDropdownProjects = async () => {
    try {
      setProjectsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      if (user.role === "ADMIN" || user.role === "MANAGER") {
        // Admins and Managers view all projects
        const res = await fetch(`${API_URL}/api/projects`, { headers });
        const data = await res.json();
        if (res.ok) {
          setProjects(data.projects || []);
        }
      } else {
        // Employees only view projects they are assigned to
        // 1. Fetch all employees to find their employee record
        const empRes = await fetch(`${API_URL}/api/employees`, { headers });
        const empData = await empRes.json();
        
        if (empRes.ok) {
          const currentEmployee = (empData.employees || []).find(
            (emp) => emp.userId === user.id
          );

          if (currentEmployee) {
            // 2. Fetch projects for this employeeId
            const projRes = await fetch(
              `${API_URL}/api/employees/${currentEmployee.id}/projects`,
              { headers }
            );
            const projData = await projRes.json();
            if (projRes.ok) {
              setProjects(projData.projects || []);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch dropdown projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      setDetailsLoading(true);
      const res = await fetch(`${API_URL}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProjectDetails(data.project || null);
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      setMembersLoading(true);
      const res = await fetch(`${API_URL}/api/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(Array.isArray(data) ? data : data.members || []);
      }
    } catch (error) {
      console.error("Failed to fetch project members:", error);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleRemoveMember = async (employeeId) => {
    if (!window.confirm("Are you sure you want to remove this member from the project team?")) {
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/projects/${selectedProjectId}/members/${employeeId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      
      if (res.ok) {
        // Refresh without full page reload
        fetchProjectMembers(selectedProjectId);
      } else {
        alert(data.message || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Error removing member");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Local filtering logic based on First Name, Last Name, Department, and Designation
  const filteredMembers = members.filter((member) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const firstName = (member.employee?.user?.firstName || "").toLowerCase();
    const lastName = (member.employee?.user?.lastName || "").toLowerCase();
    const departmentName = (member.employee?.department?.name || "").toLowerCase();
    const designation = (member.employee?.designation || "").toLowerCase();

    return (
      firstName.includes(q) ||
      lastName.includes(q) ||
      departmentName.includes(q) ||
      designation.includes(q)
    );
  });

  return (
    <div className="project-team-container" style={{ paddingBottom: "40px" }}>
      {/* Page Header */}
      <div className="section-header" style={{ marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)" }}>Project Team</h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            View and manage project members assigned to company projects.
          </p>
        </div>
      </div>

      {/* Project Selector Box */}
      <div 
        className="management-form" 
        style={{ 
          background: "var(--bg-card)", 
          boxShadow: "var(--shadow-sm)", 
          border: "1px solid var(--border-color)", 
          borderRadius: "var(--radius-lg)",
          padding: "var(--spacing-lg)",
          marginBottom: "24px"
        }}
      >
        <div className="form-group" style={{ maxWidth: "400px" }}>
          <label htmlFor="select-project" style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
            Select Project
          </label>
          <select
            id="select-project"
            className="form-control"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={projectsLoading || projects.length === 0}
            style={{ 
              padding: "12px 16px", 
              borderRadius: "var(--radius-md)", 
              border: "1px solid var(--border-color)",
              fontSize: "14px"
            }}
          >
            {projectsLoading ? (
              <option value="" disabled>Loading projects...</option>
            ) : projects.length === 0 ? (
              <option value="" disabled>No Projects Assigned</option>
            ) : (
              <>
                <option value="">Choose a project...</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      {/* Conditional Layout */}
      {!selectedProjectId ? (
        <div className="empty-state-card" style={{ padding: "60px 20px" }}>
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="60" height="60" style={{ color: "var(--primary)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21c-2.243 0-4.3-.647-6.03-1.758a18.283 18.283 0 012.304-3.417M15 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm9.563 5.48c.506-.514.814-1.21.814-1.98a4.125 4.125 0 00-7.533-2.493M18.75 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p style={{ marginTop: "16px", fontWeight: "600", fontSize: "16px" }}>No Project Selected</p>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Please pick a project from the dropdown list to view details and team members.</p>
        </div>
      ) : (
        <>
          {/* Project Details Section */}
          <div 
            className="project-details-card" 
            style={{ 
              background: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
              padding: "var(--spacing-lg)",
              marginBottom: "24px"
            }}
          >
            {detailsLoading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Loading project details...</span>
              </div>
            ) : projectDetails ? (
              <div>
                <div 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start", 
                    flexWrap: "wrap", 
                    gap: "12px", 
                    marginBottom: "16px",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "16px"
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>
                      {projectDetails.name}
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {projectDetails.description || "No description provided for this project."}
                    </p>
                  </div>
                  <div>
                    <span 
                      className={`badge status-${projectDetails.status ? projectDetails.status.toLowerCase().replace("_", "") : "pending"}`}
                      style={{ padding: "6px 12px", fontSize: "12px", textTransform: "capitalize" }}
                    >
                      {projectDetails.status || "PLANNING"}
                    </span>
                  </div>
                </div>

                <div 
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                    gap: "16px",
                    fontSize: "14px"
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>
                      Created Date
                    </span>
                    <span style={{ fontWeight: "600", color: "var(--text-main)", marginTop: "2px", display: "inline-block" }}>
                      {formatDate(projectDetails.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>
                      Created By
                    </span>
                    <span style={{ fontWeight: "600", color: "var(--text-main)", marginTop: "2px", display: "inline-block" }}>
                      {projectDetails.createdBy 
                        ? `${projectDetails.createdBy.firstName} ${projectDetails.createdBy.lastName || ""}`.trim()
                        : "System"
                      }
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>Unable to retrieve details for this project.</p>
            )}
          </div>

          {/* Team Members Section */}
          <div 
            className="team-members-section"
            style={{ 
              background: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
              padding: "var(--spacing-lg)"
            }}
          >
            {/* Toolbar: Stats & Search */}
            <div 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                flexWrap: "wrap", 
                gap: "16px", 
                marginBottom: "20px" 
              }}
            >
              {/* Statistics */}
              <div>
                <span 
                  style={{ 
                    background: "var(--primary-light)", 
                    color: "var(--primary)", 
                    fontWeight: "700", 
                    fontSize: "14px", 
                    padding: "6px 12px", 
                    borderRadius: "9999px",
                    display: "inline-block"
                  }}
                >
                  Members: {filteredMembers.length}
                </span>
              </div>

              {/* Local Search Input */}
              <div className="search-wrapper" style={{ maxWidth: "320px", width: "100%", margin: 0 }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search members..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: "var(--radius-md)", padding: "10px 14px 10px 40px" }}
                />
              </div>
            </div>

            {/* Members Table */}
            {membersLoading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Loading team members...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="empty-state-card" style={{ padding: "40px 20px" }}>
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="40" height="40">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p style={{ marginTop: "12px", fontWeight: "600" }}>No Members Found</p>
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Try searching with a different name, department or designation.</p>
              </div>
            ) : (
              <div className="table-container full-height">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Joined Date</th>
                      {user.role === "ADMIN" && <th style={{ textAlign: "right" }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => {
                      const employeeId = member.employeeId;
                      const empName = `${member.employee?.user?.firstName || ""} ${member.employee?.user?.lastName || ""}`.trim() || "—";
                      const deptName = member.employee?.department?.name || "—";
                      const designation = member.employee?.designation || "—";
                      // Display joinedDate or joinedAt
                      const joinedDateStr = formatDate(member.joinedAt || member.joinedAt);

                      return (
                        <tr key={member.id} style={{ transition: "background-color 0.15s ease" }}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div 
                                className="user-avatar" 
                                style={{ 
                                  width: "30px", 
                                  height: "30px", 
                                  fontSize: "11px",
                                  boxShadow: "none"
                                }}
                              >
                                {empName.charAt(0)}
                              </div>
                              <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                                {empName}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: "500", color: "var(--text-main)" }}>{deptName}</span>
                          </td>
                          <td>{designation}</td>
                          <td>{joinedDateStr}</td>
                          {user.role === "ADMIN" && (
                            <td style={{ textAlign: "right" }}>
                              <button
                                className="btn btn-danger"
                                style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "var(--radius-sm)" }}
                                onClick={() => handleRemoveMember(employeeId)}
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ProjectTeamPage;
