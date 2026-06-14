import React, { useState, useEffect } from "react";

function TaskManagement() {
  const [tasks, setTasks] = useState([]);

  const [task, setTask] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedToId: "",
    priority: "MEDIUM",
    dueDate: ""
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5001/api/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (res.ok) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error(error);
    }
  };

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

      if (res.ok) {
        setTask({
          title: "",
          description: "",
          projectId: "",
          assignedToId: "",
          priority: "MEDIUM",
          dueDate: ""
        });

        fetchTasks();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create task");
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/api/tasks/${id}`,
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
        fetchTasks();
      }
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
        value={task.title}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Task Description"
        value={task.description}
        onChange={handleChange}
      />

      <input
        name="projectId"
        placeholder="Project ID"
        value={task.projectId}
        onChange={handleChange}
      />

      <input
        name="assignedToId"
        placeholder="Assign To User ID"
        value={task.assignedToId}
        onChange={handleChange}
      />

      <input
        type="date"
        name="dueDate"
        value={task.dueDate}
        onChange={handleChange}
      />

      <select
        name="priority"
        value={task.priority}
        onChange={handleChange}
      >
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </select>

      <button onClick={createTask}>
        Create Task
      </button>

      <hr />

      <h3>Tasks</h3>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Project</th>
            <th>Assigned To</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>

              <td>{task.title}</td>

              <td>{task.project?.name}</td>

              <td>
                {task.assignedTo?.firstName}{" "}
                {task.assignedTo?.lastName}
              </td>

              <td>{task.priority}</td>

              <td>{task.status}</td>

              <td>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "No Due Date"}
              </td>

              <td>
                <button
                  onClick={() =>
                    deleteTask(task.id)
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

export default TaskManagement;