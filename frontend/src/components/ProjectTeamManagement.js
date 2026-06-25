import React, { useState, useEffect } from "react";
import { useSearch } from "../utils/SearchContext";
import { API_URL } from "../config/api";

function ProjectTeamManagement() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [projectsLoading, setProjectsLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchMembers(selectedProjectId);
    } else {
      setMembers([]);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchMembers = async (projectId) => {
    try {
      setMembersLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/projects/${projectId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(Array.isArray(data) ? data : data.members || []);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAssignEmployee = async () => {
    if (!selectedProjectId) {
      alert("Please select a project.");
      return;
    }
    if (!selectedEmployeeId) {
      alert("Please select an employee.");
      return;
    }

    try {
      setAssignLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/projects/${selectedProjectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: Number(selectedEmployeeId)
        })
      });

      const data = await res.json();
      alert(data.message || (res.ok ? "Employee assigned successfully" : "Failed to assign employee"));

      if (res.ok) {
        setSelectedEmployeeId("");
        fetchMembers(selectedProjectId);
      }
    } catch (error) {
      console.error("Error assigning employee:", error);
      alert("Failed to assign employee");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to remove this employee from the project?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/projects/${selectedProjectId}/members/${employeeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      alert(data.message || (res.ok ? "Employee removed from project" : "Failed to remove employee"));

      if (res.ok) {
        fetchMembers(selectedProjectId);
      }
    } catch (error) {
      console.error("Error removing employee:", error);
      alert("Failed to remove employee");
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

  // Search filtering on member names or designations
  const filteredMembers = members.filter((member) => {
    const q = searchQuery.toLowerCase();
    const empName = `${member.employee?.user?.firstName || ""} ${member.employee?.user?.lastName || ""}`.toLowerCase();
    const designation = (member.employee?.designation || "").toLowerCase();
    return empName.includes(q) || designation.includes(q);
  });

  return (
    <div>
      <div className="section-header">
        <h2>Project Team Management</h2>
      </div>

      {/* Assign Employee Form */}
      <div className="management-form">
        <div className="section-header" style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "600" }}>Assign Employee To Project</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="select-project">Select Project</label>
            <select
              id="select-project"
              className="form-control"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={projectsLoading || projects.length === 0}
            >
              {projectsLoading ? (
                <option value="" disabled>Loading projects...</option>
              ) : projects.length === 0 ? (
                <option value="" disabled>No Projects Found</option>
              ) : (
                <>
                  <option value="">Select Project...</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="select-employee">Select Employee</label>
            <select
              id="select-employee"
              className="form-control"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              disabled={employeesLoading || employees.length === 0}
            >
              {employeesLoading ? (
                <option value="" disabled>Loading employees...</option>
              ) : employees.length === 0 ? (
                <option value="" disabled>No Employees Found</option>
              ) : (
                <>
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {`${emp.user?.firstName || ""} ${emp.user?.lastName || ""}`.trim()}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAssignEmployee}
          disabled={assignLoading || !selectedProjectId || !selectedEmployeeId}
        >
          {assignLoading ? "Assigning..." : "Assign Employee"}
        </button>
      </div>

      {/* Project Team Viewer */}
      <div className="section-header" style={{ marginTop: "32px", marginBottom: "16px" }}>
        <h3>Project Team Members</h3>
      </div>

      {!selectedProjectId ? (
        <div className="empty-state-card">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21c-2.243 0-4.3-.647-6.03-1.758a18.283 18.283 0 012.304-3.417M15 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm9.563 5.48c.506-.514.814-1.21.814-1.98a4.125 4.125 0 00-7.533-2.493M18.75 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>Please select a project to view its team members</p>
        </div>
      ) : membersLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading team members...</span>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="empty-state-card">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <p>No team members assigned to this project yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Designation</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <span style={{ fontWeight: "600" }}>
                      {`${member.employee?.user?.firstName || ""} ${member.employee?.user?.lastName || ""}`.trim() || "—"}
                    </span>
                  </td>
                  <td>{member.employee?.designation || "—"}</td>
                  <td>{formatDate(member.joinedAt)}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => handleRemoveEmployee(member.employeeId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProjectTeamManagement;
