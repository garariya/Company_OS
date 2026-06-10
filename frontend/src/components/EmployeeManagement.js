import React, { useState } from "react";

function EmployeeManagement() {
  const [formData, setFormData] = useState({
    userId: "",
    departmentId: "",
    designation: "",
    salary: "",
    joiningDate: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createEmployee = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5001/api/employees",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await res.json();

      alert(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Employee Management</h2>

      <input
        name="userId"
        placeholder="User ID"
        onChange={handleChange}
      />

      <input
        name="departmentId"
        placeholder="Department ID"
        onChange={handleChange}
      />

      <input
        name="designation"
        placeholder="Designation"
        onChange={handleChange}
      />

      <input
        name="salary"
        placeholder="Salary"
        onChange={handleChange}
      />

      <input
        type="date"
        name="joiningDate"
        onChange={handleChange}
      />

      <button onClick={createEmployee}>
        Create Employee
      </button>
    </div>
  );
}

export default EmployeeManagement;