import React, { useState, useEffect } from "react";

function ProjectManagement() {
  const [projects, setProjects] = useState([]);

  const [project, setProject] = useState({
    name: "",
    description: ""
  });

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

  const handleChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value
    });
  };

  const createProject = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5001/api/projects",
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
    }
  };

  const deleteProject = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/api/projects/${id}`,
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

  return (
    <div>
      <h2>Project Management</h2>

      <input
        name="name"
        placeholder="Project Name"
        value={project.name}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Project Description"
        value={project.description}
        onChange={handleChange}
      />

      <button onClick={createProject}>
        Create Project
      </button>

      <hr />

      <h3>Projects</h3>

      <table border="1">
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
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.id}</td>

              <td>{project.name}</td>

              <td>{project.description}</td>

              <td>{project.status}</td>

              <td>
                {project.createdBy?.firstName}{" "}
                {project.createdBy?.lastName}
              </td>

              <td>
                <button
                  onClick={() =>
                    deleteProject(project.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectManagement;