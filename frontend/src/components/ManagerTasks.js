import React, { useState, useEffect } from "react";
import { useSearch } from "../utils/SearchContext";

function ManagerTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
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
        setTasks(data.tasks || []);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Search filtering
  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    const assignedName = `${t.assignedTo?.firstName || ""} ${t.assignedTo?.lastName || ""}`.toLowerCase();
    const projectName = (t.project?.name || "").toLowerCase();
    return (
      t.id.toString().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      projectName.includes(q) ||
      assignedName.includes(q) ||
      (t.priority || "").toLowerCase().includes(q) ||
      (t.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="section-header">
        <h2>Team Tasks</h2>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading tasks...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state-card">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No Tasks Found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const priorityClass = `badge priority-${task.priority ? task.priority.toLowerCase() : "medium"}`;
                const statusClass = `badge status-${task.status ? task.status.toLowerCase().replace("_", "") : "pending"}`;
                return (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>
                      <span style={{ fontWeight: "600" }}>{task.title}</span>
                    </td>
                    <td>
                      {task.assignedTo
                        ? `${task.assignedTo.firstName} ${task.assignedTo.lastName || ""}`
                        : "—"}
                    </td>
                    <td>
                      <span className={priorityClass}>{task.priority}</span>
                    </td>
                    <td>
                      <span className={statusClass}>
                        {task.status || "PENDING"}
                      </span>
                    </td>
                    <td>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No Due Date"}
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

export default ManagerTasks;