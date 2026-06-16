import React, { useState, useEffect } from "react";
import { useSearch } from "../utils/SearchContext";
import { getUser } from "../utils/auth";

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localStatuses, setLocalStatuses] = useState({});
  const [updateLoading, setUpdateLoading] = useState({});

  // Local filters
  const [filterTitle, setFilterTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const { searchQuery } = useSearch();
  const user = getUser() || { id: null };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
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
        // Only show tasks assigned to this employee
        const allTasks = data.tasks || [];
        const myTasks = allTasks.filter(t => t.assignedTo?.id === user.id);
        setTasks(myTasks);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId) => {
    const status = localStatuses[taskId] || tasks.find(t => t.id === taskId)?.status;
    
    try {
      setUpdateLoading(prev => ({ ...prev, [taskId]: true }));
      const token = localStorage.getItem("token");
      
      const res = await fetch(`http://localhost:5001/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        // Clear local modification state
        const updatedLocalStatuses = { ...localStatuses };
        delete updatedLocalStatuses[taskId];
        setLocalStatuses(updatedLocalStatuses);
        
        // Refresh task list
        fetchMyTasks();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update task status");
    } finally {
      setUpdateLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  // Status visual colors
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "TODO":
        return { backgroundColor: "#F1F5F9", color: "#475569" };
      case "IN_PROGRESS":
        return { backgroundColor: "#FFEDD5", color: "#C2410C" };
      case "DONE":
        return { backgroundColor: "#D1FAE5", color: "#065F46" };
      default:
        return { backgroundColor: "#F1F5F9", color: "#475569" };
    }
  };

  // Progress Calculations
  const todoCount = tasks.filter(t => t.status === "TODO").length;
  const inProgressCount = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const doneCount = tasks.filter(t => t.status === "DONE").length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  // Search and local filtering
  const filteredTasks = tasks.filter((task) => {
    const titleMatch = task.title.toLowerCase().includes(filterTitle.toLowerCase());
    const statusMatch = filterStatus ? task.status === filterStatus : true;
    const priorityMatch = filterPriority ? task.priority === filterPriority : true;

    const gq = searchQuery.toLowerCase();
    const globalMatch = !gq ||
      task.id.toString().includes(gq) ||
      task.title.toLowerCase().includes(gq) ||
      (task.project?.name || "").toLowerCase().includes(gq) ||
      (task.priority || "").toLowerCase().includes(gq) ||
      (task.status || "").toLowerCase().includes(gq);

    return titleMatch && statusMatch && priorityMatch && globalMatch;
  });

  return (
    <div>
      <div className="section-header">
        <h2>My Tasks</h2>
      </div>

      {/* Statistics Cards */}
      <div className="cards-grid">
        <div className="stat-card">
          <div className="stat-card-details">
            <h3>Completion Progress</h3>
            <div className="stat-value">{completionRate}%</div>
          </div>
          <div className="stat-card-icon info">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-details">
            <h3>To Do</h3>
            <div className="stat-value">{todoCount}</div>
          </div>
          <div className="stat-card-icon warning" style={{ backgroundColor: "#F1F5F9", color: "#475569" }}>
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-details">
            <h3>In Progress</h3>
            <div className="stat-value">{inProgressCount}</div>
          </div>
          <div className="stat-card-icon primary" style={{ backgroundColor: "#FFEDD5", color: "#C2410C" }}>
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-details">
            <h3>Completed</h3>
            <div className="stat-value">{doneCount}</div>
          </div>
          <div className="stat-card-icon success">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="management-form" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "16px", marginBottom: "20px" }}>
        <div className="form-grid" style={{ marginBottom: 0 }}>
          <div className="form-group">
            <label htmlFor="filter-title">Task Title</label>
            <input
              id="filter-title"
              type="text"
              className="form-control"
              placeholder="Filter by title..."
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filter-status">Status</label>
            <select
              id="filter-status"
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filter-priority">Priority</label>
            <select
              id="filter-priority"
              className="form-control"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Content */}
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
        <div className="table-container full-height">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Project</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const priorityClass = `badge priority-${task.priority ? task.priority.toLowerCase() : "medium"}`;
                const currentSelectedStatus = localStatuses[task.id] !== undefined ? localStatuses[task.id] : task.status;

                return (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>
                      <span style={{ fontWeight: "600" }}>{task.title}</span>
                    </td>
                    <td>
                      <span className={priorityClass}>{task.priority}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span 
                          className="badge" 
                          style={{ 
                            ...getStatusBadgeStyle(currentSelectedStatus),
                            padding: "4px 8px", 
                            fontSize: "11px",
                            fontWeight: "700"
                          }}
                        >
                          {currentSelectedStatus}
                        </span>
                        <select
                          className="form-control"
                          style={{ width: "135px", padding: "4px 8px", fontSize: "13px", height: "auto", display: "inline-block", margin: 0 }}
                          value={currentSelectedStatus}
                          onChange={(e) => setLocalStatuses({ ...localStatuses, [task.id]: e.target.value })}
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="DONE">DONE</option>
                        </select>
                      </div>
                    </td>
                    <td>{task.project?.name || "—"}</td>
                    <td>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No Due Date"}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => handleUpdateStatus(task.id)}
                        disabled={updateLoading[task.id] || currentSelectedStatus === task.status}
                      >
                        {updateLoading[task.id] ? "Updating..." : "Update Status"}
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

export default MyTasks;