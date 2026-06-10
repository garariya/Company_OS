import React, { useState } from "react";

function DepartmentManagement() {
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const createDepartment = async () => {
    if (!department.trim()) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5001/api/departments",
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
    } catch (error) {
      console.error(error);
      alert("Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Department Management</h2>

      <input
        type="text"
        placeholder="Department Name"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      />

      <button
        onClick={createDepartment}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Department"}
      </button>
    </div>
  );
}

export default DepartmentManagement;