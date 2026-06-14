import React from "react";
import { getUser } from "../utils/auth";

function EmployeeProfile() {
  const user = getUser() || { email: "N/A", role: "EMPLOYEE" };

  return (
    <div>
      <div className="section-header">
        <h2>My Profile</h2>
      </div>

      <div style={{
        backgroundColor: "var(--bg-main)",
        borderRadius: "var(--radius-md)",
        padding: "var(--spacing-md)",
        border: "1px solid var(--border-color)",
        maxWidth: "400px"
      }}>
        <p style={{ marginBottom: "var(--spacing-sm)", fontSize: "14px" }}>
          <strong style={{ color: "var(--text-muted)" }}>Email:</strong> {user.email}
        </p>
        <p style={{ fontSize: "14px" }}>
          <strong style={{ color: "var(--text-muted)" }}>Role:</strong> 
          <span className={`role-badge ${user.role.toLowerCase()}`} style={{ marginLeft: "var(--spacing-sm)" }}>
            {user.role}
          </span>
        </p>
      </div>
    </div>
  );
}

export default EmployeeProfile;