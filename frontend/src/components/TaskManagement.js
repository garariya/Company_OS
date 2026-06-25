import React, { useState, useEffect } from "react";
import { useSearch } from "../utils/SearchContext";
import { API_URL } from "../config/api";

function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localStatuses, setLocalStatuses] = useState({});
  const [updateLoading, setUpdateLoading] = useState({});

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  // Local filters
  const [filterTitle, setFilterTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterUser, setFilterUser] = useState("");

  const { searchQuery } = useSearch();

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
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        const fetchedUsers = [];
        const seenUserIds = new Set();
        (data.employees || []).forEach(emp => {
          if (emp.user && !seenUserIds.has(emp.user.id)) {
            seenUserIds.add(emp.user.id);
            fetchedUsers.push(emp.user);
          }
        });
        setUsers(fetchedUsers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/tasks`,
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
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value
    });
  };

  const createTask = async () => {
    if (!task.title.trim()) {
      alert("Please enter a task title.");
      return;
    }
    if (!task.projectId) {
      alert("Please select a project.");
      return;
    }
    if (!task.assignedToId) {
      alert("Please select an employee.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...task,
            projectId: Number(task.projectId),
            assignedToId: Number(task.assignedToId)
          })
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
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId) => {
    const status = localStatuses[taskId] || tasks.find(t => t.id === taskId)?.status;
    
    try {
      setUpdateLoading(prev => ({ ...prev, [taskId]: true }));
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_URL}/api/tasks/${taskId}/status`, {
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
        
        // Refresh tasks list
        fetchTasks();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update task status");
    } finally {
      setUpdateLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/tasks/${id}`,
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

  // Local filtering logic
  const filteredTasks = tasks.filter((t) => {
    const titleMatch = t.title.toLowerCase().includes(filterTitle.toLowerCase());
    const statusMatch = filterStatus ? t.status === filterStatus : true;
    const priorityMatch = filterPriority ? t.priority === filterPriority : true;
    
    const assignedName = `${t.assignedTo?.firstName || ""} ${t.assignedTo?.lastName || ""}`.toLowerCase();
    const userMatch = filterUser ? assignedName.includes(filterUser.toLowerCase()) : true;

    const gq = searchQuery.toLowerCase();
    const projectName = (t.project?.name || "").toLowerCase();
    const globalMatch = !gq ||
      t.id.toString().includes(gq) ||
      t.title.toLowerCase().includes(gq) ||
      (t.description || "").toLowerCase().includes(gq) ||
      projectName.includes(gq) ||
      assignedName.includes(gq) ||
      (t.priority || "").toLowerCase().includes(gq) ||
      (t.status || "").toLowerCase().includes(gq);

    return titleMatch && statusMatch && priorityMatch && userMatch && globalMatch;
  });

  return (
    <div>
      <div className="section-header">
        <h2>Task Management</h2>
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

      {/* Styled Form Grid */}
      <div className="management-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              name="title"
              placeholder="e.g. Design Database Models"
              className="form-control"
              value={task.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Task Description</label>
            <textarea
              id="task-desc"
              name="description"
              placeholder="Explain the technical scope..."
              className="form-control"
              style={{ minHeight: "40px", resize: "vertical" }}
              value={task.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-projectId">Project</label>
            <select
              id="task-projectId"
              name="projectId"
              className="form-control"
              value={task.projectId}
              onChange={handleChange}
              disabled={projectsLoading || projects.length === 0}
            >
              {projectsLoading ? (
                <option value="" disabled>Loading projects...</option>
              ) : projects.length === 0 ? (
                <option value="" disabled>No Projects Found</option>
              ) : (
                <>
                  <option value="" disabled>Select Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-assigned">Assign To</label>
            <select
              id="task-assigned"
              name="assignedToId"
              className="form-control"
              value={task.assignedToId}
              onChange={handleChange}
              disabled={usersLoading || users.length === 0}
            >
              {usersLoading ? (
                <option value="" disabled>Loading users...</option>
              ) : users.length === 0 ? (
                <option value="" disabled>No Users Found</option>
              ) : (
                <>
                  <option value="" disabled>Select User...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {`${u.firstName} ${u.lastName || ""}`.trim()}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-dueDate">Due Date</label>
            <input
              id="task-dueDate"
              type="date"
              name="dueDate"
              className="form-control"
              value={task.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              name="priority"
              className="form-control"
              value={task.priority}
              onChange={handleChange}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={createTask}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Task"}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="management-form" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "16px", marginBottom: "20px", marginTop: "32px" }}>
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
            <label htmlFor="filter-user">Assigned User</label>
            <input
              id="filter-user"
              type="text"
              className="form-control"
              placeholder="Filter by user name..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
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

      <div className="section-header" style={{ marginBottom: "16px" }}>
        <h3>Tasks</h3>
      </div>

      {fetchLoading ? (
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
              {filteredTasks.map((t) => {
                const priorityClass = `badge priority-${t.priority ? t.priority.toLowerCase() : "medium"}`;
                const currentSelectedStatus = localStatuses[t.id] !== undefined ? localStatuses[t.id] : t.status;

                return (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>
                      <span style={{ fontWeight: "600" }}>{t.title}</span>
                    </td>
                    <td>{t.project?.name || `Project #${t.projectId}`}</td>
                    <td>
                      {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName || ""}` : `User #${t.assignedToId}`}
                    </td>
                    <td>
                      <span className={priorityClass}>{t.priority}</span>
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
                          onChange={(e) => setLocalStatuses({ ...localStatuses, [t.id]: e.target.value })}
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="DONE">DONE</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No Due Date"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => handleUpdateStatus(t.id)}
                          disabled={updateLoading[t.id] || currentSelectedStatus === t.status}
                        >
                          {updateLoading[t.id] ? "Saving..." : "Update Status"}
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => deleteTask(t.id)}
                        >
                          Delete
                        </button>
                      </div>
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

export default TaskManagement;