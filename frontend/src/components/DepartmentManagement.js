import React, { useEffect, useState } from "react";

function DepartmentManagement() {
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(
        "http://localhost:5001/api/departments",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      const data = await res.json();
  
      if (res.ok) {
        setDepartments(data.departments);
      }
  
    } catch (error) {
      console.error(error);
    }
  };

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
      fetchDepartments()
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

      <h3>Departments</h3>

        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>

          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.id}</td>
                <td>{dept.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

export default DepartmentManagement;