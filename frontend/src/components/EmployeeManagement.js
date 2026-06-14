import React, { useState, useEffect } from "react";

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);

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
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error(error);
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
    }
  };

  const deleteEmployee = async (id) => {
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

  return (
    <div>
      <h2>Employee Management</h2>

      <div>
        <input
          name="userId"
          placeholder="User ID"
          value={formData.userId}
          onChange={handleChange}
        />

        <input
          name="departmentId"
          placeholder="Department ID"
          value={formData.departmentId}
          onChange={handleChange}
        />

        <input
          name="designation"
          placeholder="Designation"
          value={formData.designation}
          onChange={handleChange}
        />

        <input
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
        />

        <input
          type="date"
          name="joiningDate"
          value={formData.joiningDate}
          onChange={handleChange}
        />

        <button onClick={createEmployee}>
          Create Employee
        </button>
      </div>

      <hr />

      <h3>Employees</h3>

      <table border="1">
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
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>

              <td>{employee.userId}</td>

              <td>
                {employee.department?.name ||
                  employee.departmentId}
              </td>

              <td>{employee.designation}</td>

              <td>{employee.salary}</td>

              <td>
                {new Date(
                  employee.joiningDate
                ).toLocaleDateString()}
              </td>

              <td>
                <button
                  onClick={() =>
                    deleteEmployee(employee.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeManagement;