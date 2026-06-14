import React, { useState, useEffect } from "react";
import { useSearch } from "../utils/SearchContext";

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

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
  }, []);

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
      }

    } catch (error) {
      console.error(error);
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
            <label htmlFor="userId">User ID</label>
            <input
              id="userId"
              name="userId"
              placeholder="e.g. 1"
              className="form-control"
              value={formData.userId}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="departmentId">Department ID</label>
            <input
              id="departmentId"
              name="departmentId"
              placeholder="e.g. 3"
              className="form-control"
              value={formData.departmentId}
              onChange={handleChange}
            />
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