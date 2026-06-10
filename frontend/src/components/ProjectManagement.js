import React, { useState } from "react";

function ProjectManagement() {
  const [project, setProject] = useState({
    name: "",
    description: ""
  });

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
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Description"
        onChange={handleChange}
      />

      <button onClick={createProject}>
        Create Project
      </button>
    </div>
  );
}

export default ProjectManagement;