import React, { useState, useEffect } from "react";
import { useSearch } from "../utils/SearchContext";

function ManagerProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5001/api/projects",
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

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Search filtering
  const filteredProjects = projects.filter((proj) => {
    const q = searchQuery.toLowerCase();
    const creatorName = `${proj.createdBy?.firstName || ""} ${proj.createdBy?.lastName || ""}`.toLowerCase();
    return (
      proj.id.toString().includes(q) ||
      proj.name.toLowerCase().includes(q) ||
      (proj.status || "").toLowerCase().includes(q) ||
      creatorName.includes(q)
    );
  });

  return (
    <div>
      <div className="section-header">
        <h2>Managed Projects</h2>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state-card">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
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
                <th>Status</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const statusClass = `badge status-${project.status ? project.status.toLowerCase().replace("_", "") : "pending"}`;
                return (
                  <tr key={project.id}>
                    <td>{project.id}</td>
                    <td>
                      <span style={{ fontWeight: "600" }}>{project.name}</span>
                    </td>
                    <td>
                      <span className={statusClass}>
                        {project.status || "PENDING"}
                      </span>
                    </td>
                    <td>
                      {project.createdBy
                        ? `${project.createdBy.firstName} ${project.createdBy.lastName || ""}`
                        : "—"}
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

export default ManagerProjects;