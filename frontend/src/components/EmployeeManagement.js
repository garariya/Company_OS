import React, { useState, useEffect } from "react";
import { useSearch } from "../utils/SearchContext";

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const { searchQuery } = useSearch();

  const [formData, setFormData] = useState({
    userId: "",
    departmentId: "",
    designation: "",
    salary: "",
    joiningDate: ""
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/departments", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeptLoading(false);
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

  const fetchEmployees = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5001/api/employees",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (res.ok) {
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createEmployee = async () => {
    if (!formData.userId) {
      alert("Please select an employee.");
      return;
    }
    if (!formData.departmentId) {
      alert("Please select a department.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5001/api/employees",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            userId: Number(formData.userId),
            departmentId: Number(formData.departmentId),
            salary: formData.salary
              ? Number(formData.salary)
              : null
          })
        }
      );

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        setFormData({
          userId: "",
          departmentId: "",
          designation: "",
          salary: "",
          joiningDate: ""
        });

        fetchEmployees();
        fetchUsers();
      }

    } catch (error) {
      console.error(error);
      alert("Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/api/employees/${id}`,
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
        fetchEmployees();
        fetchUsers();
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleChange = async (employeeId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5001/api/employees/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (res.ok) {
        setEmployees(prev =>
          prev.map(emp => {
            if (emp.id === employeeId) {
              return {
                ...emp,
                user: {
                  ...emp.user,
                  role: newRole
                }
              };
            }
            return emp;
          })
        );
        alert("Role updated successfully");
      } else {
        alert(data.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Failed to update employee role:", error);
      alert("Failed to update role due to network error");
    }
  };

  // Search filtering
  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const deptName = emp.department?.name || String(emp.departmentId || "");
    const empId = String(emp.id || "");
    const userId = String(emp.userId || "");
    const salary = String(emp.salary || "");
    const designation = emp.designation || "";
    
    return (
      empId.includes(q) ||
      userId.includes(q) ||
      designation.toLowerCase().includes(q) ||
      deptName.toLowerCase().includes(q) ||
      salary.includes(q)
    );
  });

  return (
    <div>
      <div className="section-header">
        <h2>Employee Management</h2>
      </div>

      {/* Styled Form Grid */}
      <div className="management-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="userId">Employee</label>
            <select
              id="userId"
              name="userId"
              className="form-control"
              value={formData.userId}
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
                      {`${u.firstName} ${u.lastName || ""}`.trim()} ({u.email})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="departmentId">Department</label>
            <select
              id="departmentId"
              name="departmentId"
              className="form-control"
              value={formData.departmentId}
              onChange={handleChange}
              disabled={deptLoading || departments.length === 0}
            >
              {deptLoading ? (
                <option value="" disabled>Loading departments...</option>
              ) : departments.length === 0 ? (
                <option value="" disabled>No Departments Found</option>
              ) : (
                <>
                  <option value="" disabled>Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="designation">Designation</label>
            <input
              id="designation"
              name="designation"
              placeholder="e.g. Senior Software Engineer"
              className="form-control"
              value={formData.designation}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salary</label>
            <input
              id="salary"
              name="salary"
              placeholder="e.g. 85000"
              className="form-control"
              value={formData.salary}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="joiningDate">Joining Date</label>
            <input
              id="joiningDate"
              type="date"
              name="joiningDate"
              className="form-control"
              value={formData.joiningDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={createEmployee}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Employee"}
        </button>
      </div>

      <div className="section-header" style={{ marginTop: "32px", marginBottom: "16px" }}>
        <h3>Employees</h3>
      </div>

      {fetchLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading employees...</span>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="empty-state-card">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <p>No Employees Found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Joining Date</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.userId}</td>
                  <td>
                    <span style={{ fontWeight: "600" }}>
                      {employee.department?.name || employee.departmentId}
                    </span>
                  </td>
                  <td>{employee.designation}</td>
                  <td>{employee.salary ? `$${Number(employee.salary).toLocaleString()}` : "N/A"}</td>
                  <td>{new Date(employee.joiningDate).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="form-control"
                      style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        height: "30px",
                        width: "120px",
                        backgroundPosition: "right 6px center",
                        backgroundSize: "16px",
                        paddingRight: "24px"
                      }}
                      value={employee.user?.role || "EMPLOYEE"}
                      onChange={(e) => handleRoleChange(employee.id, e.target.value)}
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => deleteEmployee(employee.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;