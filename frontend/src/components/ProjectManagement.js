import React, { useState, useEffect } from "react";
import { useSearch } from "../utils/SearchContext";
import { API_URL } from "../config/api";

function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const { searchQuery } = useSearch();

  const [project, setProject] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (res.ok) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value
    });
  };

  const createProject = async () => {
    if (!project.name.trim()) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(project)
        }
      );

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        setProject({
          name: "",
          description: ""
        });

        fetchProjects();
      }

    } catch (error) {
      console.error(error);
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/projects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        fetchProjects();
      }

    } catch (error) {
      console.error(error);
    }
  };

  // Search filtering
  const filteredProjects = projects.filter((proj) => {
    const q = searchQuery.toLowerCase();
    const creatorName = `${proj.createdBy?.firstName || ""} ${proj.createdBy?.lastName || ""}`.toLowerCase();
    
    return (
      proj.id.toString().includes(q) ||
      proj.name.toLowerCase().includes(q) ||
      (proj.description || "").toLowerCase().includes(q) ||
      (proj.status || "").toLowerCase().includes(q) ||
      creatorName.includes(q)
    );
  });

  return (
    <div>
      <div className="section-header">
        <h2>Project Management</h2>
      </div>

      {/* Styled Form Container */}
      <div className="management-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="proj-name">Project Name</label>
            <input
              id="proj-name"
              name="name"
              placeholder="e.g. ERP System Phase 1"
              className="form-control"
              value={project.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="proj-desc">Project Description</label>
            <textarea
              id="proj-desc"
              name="description"
              placeholder="Provide a detailed description of the project goals..."
              className="form-control"
              style={{ minHeight: "80px", resize: "vertical" }}
              value={project.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={createProject}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </div>

      <div className="section-header" style={{ marginTop: "32px", marginBottom: "16px" }}>
        <h3>Projects</h3>
      </div>

      {fetchLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state-card">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
          </svg>
          <p>No Projects Found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj) => {
                const statusClass = `badge status-${proj.status ? proj.status.toLowerCase().replace("_", "") : "pending"}`;
                return (
                  <tr key={proj.id}>
                    <td>{proj.id}</td>
                    <td>
                      <span style={{ fontWeight: "600" }}>{proj.name}</span>
                    </td>
                    <td style={{ whiteSpace: "normal", maxWidth: "250px" }}>{proj.description || "—"}</td>
                    <td>
                      <span className={statusClass}>
                        {proj.status || "PENDING"}
                      </span>
                    </td>
                    <td>
                      {proj.createdBy ? `${proj.createdBy.firstName} ${proj.createdBy.lastName || ""}` : "—"}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                        onClick={() => deleteProject(proj.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProjectManagement;