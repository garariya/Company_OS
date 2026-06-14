import React, { useState, useEffect } from "react";

function MyTasks() {
  const [tasks, setTasks] = useState([]);

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

  return (
    <div>
      <h2>My Tasks</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Task</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Project</th>
            <th>Due Date</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>

              <td>{task.title}</td>

              <td>{task.priority}</td>

              <td>{task.status}</td>

              <td>{task.project?.name}</td>

              <td>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "No Due Date"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyTasks;