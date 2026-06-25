import React, { useState, useEffect } from "react";
import { useSearch } from "../utils/SearchContext";
import { getUser } from "../utils/auth";
import { API_URL } from "../config/api";

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { searchQuery } = useSearch();
  const user = getUser() || { id: null };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch projects and tasks to find user-related projects
      const [projRes, taskRes] = await Promise.all([
        fetch(`${API_URL}/api/projects`, { headers }),
        fetch(`${API_URL}/api/tasks`, { headers })
      ]);

      const [projData, taskData] = await Promise.all([
        projRes.json(),
        taskRes.json()
      ]);

      const allProjects = projData.projects || [];
      const allTasks = taskData.tasks || [];

      // Filter tasks assigned to this employee
      const myTasks = allTasks.filter(t => t.assignedTo?.id === user.id);

      // Projects created by employee or where they have tasks assigned
      const myProjectsFiltered = allProjects.filter(
        p => p.createdBy?.id === user.id || myTasks.some(t => t.projectId === p.id)
      );

      setProjects(myProjectsFiltered);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Search filtering
  const filteredProjects = projects.filter((project) => {
    const q = searchQuery.toLowerCase();
    return (
      project.id.toString().includes(q) ||
      project.name.toLowerCase().includes(q) ||
      (project.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="section-header">
        <h2>My Projects</h2>
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
                <th>Project</th>
                <th>Status</th>
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

export default MyProjects;