import React, { useState, useEffect } from "react";
import { useSearch } from "../utils/SearchContext";

function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

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
      const res = await fetch("http://localhost:5001/api/projects", {
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
      const res = await fetch("http://localhost:5001/api/employees", {
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
        "http://localhost:5001/api/tasks",
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

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
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

  // Search filtering
  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    const assignedName = `${t.assignedTo?.firstName || ""} ${t.assignedTo?.lastName || ""}`.toLowerCase();
    const projectName = (t.project?.name || "").toLowerCase();
    const priority = t.priority || "";
    const status = t.status || "";
    
    return (
      t.id.toString().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      projectName.includes(q) ||
      assignedName.includes(q) ||
      priority.toLowerCase().includes(q) ||
      status.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="section-header">
        <h2>Task Management</h2>
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

      <div className="section-header" style={{ marginTop: "32px", marginBottom: "16px" }}>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h37.5M9 15h33.33M9 18h29.16" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
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
                const statusClass = `badge status-${t.status ? t.status.toLowerCase().replace("_", "") : "pending"}`;
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
                      <span className={statusClass}>
                        {t.status || "PENDING"}
                      </span>
                    </td>
                    <td>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No Due Date"}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                        onClick={() => deleteTask(t.id)}
                      >
                        Delete
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

export default TaskManagement;