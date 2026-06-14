import React from "react";

function DashboardCard({ title, value, icon }) {
  // Select color style class based on statistical type
  const getThemeClass = () => {
    const name = String(title).toLowerCase();
    if (name.includes("department")) return "primary";
    if (name.includes("employee")) return "success";
    if (name.includes("project")) return "warning";
    return "info";
  };

  const themeClass = getThemeClass();

  return (
    <div className="stat-card">
      <div className="stat-card-details">
        <h3>{title}</h3>
        <div className="stat-value">{value !== undefined && value !== null ? value : 0}</div>
      </div>
      <div className={`stat-card-icon ${themeClass}`}>
        {icon}
      </div>
    </div>
  );
}

export default DashboardCard;
