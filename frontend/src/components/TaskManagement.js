import React, { useState } from "react";

function TaskManagement() {
  const [task, setTask] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedToId: "",
    priority: "MEDIUM"
  });

  const handleChange = (e) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value
    });
  };

  const createTask = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5001/api/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(task)
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
      <h2>Task Management</h2>

      <input
        name="title"
        placeholder="Task Title"
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Task Description"
        onChange={handleChange}
      />

      <input
        name="projectId"
        placeholder="Project ID"
        onChange={handleChange}
      />

      <input
        name="assignedToId"
        placeholder="Assign To User ID"
        onChange={handleChange}
      />

      <select
        name="priority"
        onChange={handleChange}
      >
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </select>

      <button onClick={createTask}>
        Create Task
      </button>
    </div>
  );
}

export default TaskManagement;