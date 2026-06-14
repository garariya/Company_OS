import React, { useState, useEffect } from "react";

function MyProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
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
        setProjects(data.projects);
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>My Projects</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Project</th>
            <th>Status</th>
            <th>Created By</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.id}</td>

              <td>{project.name}</td>

              <td>{project.status}</td>

              <td>
                {project.createdBy?.firstName}{" "}
                {project.createdBy?.lastName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyProjects;