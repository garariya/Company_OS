import React, { useEffect, useState } from "react";
import { useSearch } from "../utils/SearchContext";
import { API_URL } from "../config/api";

function DepartmentManagement() {
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/departments`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (res.ok) {
        setDepartments(data.departments || []);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setFetchLoading(false);
    }
  };

  const createDepartment = async () => {
    if (!department.trim()) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/departments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: department
          })
        }
      );

      const data = await res.json();

      alert(data.message);

      setDepartment("");
      fetchDepartments();
    } catch (error) {
      console.error(error);
      alert("Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  // Search filtering
  const filteredDepartments = departments.filter((dept) => {
    const q = searchQuery.toLowerCase();
    return (
      dept.id.toString().includes(q) ||
      dept.name.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="section-header">
        <h2>Department Management</h2>
      </div>

      {/* Styled Form Container */}
      <div className="management-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="dept-name">Department Name</label>
            <input
              id="dept-name"
              type="text"
              className="form-control"
              placeholder="e.g. Engineering, HR, Sales"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={createDepartment}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Department"}
        </button>
      </div>

      <div className="section-header" style={{ marginTop: "32px", marginBottom: "16px" }}>
        <h3>Departments</h3>
      </div>

      {fetchLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading departments...</span>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="empty-state-card">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p>No Departments Found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>
                  <td>
                    <span style={{ fontWeight: "600" }}>{dept.name}</span>
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

export default DepartmentManagement;