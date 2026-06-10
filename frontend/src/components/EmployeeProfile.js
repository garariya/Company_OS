import React from "react";

function EmployeeProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <h2>Profile</h2>

      <p>Email: {user?.email}</p>

      <p>Role: {user?.role}</p>
    </div>
  );
}

export default EmployeeProfile;