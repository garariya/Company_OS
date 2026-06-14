import React from "react";

function TeamOverview() {
  return (
    <div>
      <div className="section-header">
        <h2>Team Overview</h2>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "var(--spacing-md)",
        backgroundColor: "var(--bg-main)",
        borderRadius: "var(--radius-md)",
        padding: "var(--spacing-md)",
        border: "1px solid var(--border-color)"
      }}>
        <div style={{ padding: "var(--spacing-sm)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Total Team Members</div>
          <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>0</div>
        </div>

        <div style={{ padding: "var(--spacing-sm)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Active Projects</div>
          <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>0</div>
        </div>

        <div style={{ padding: "var(--spacing-sm)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Completed Tasks</div>
          <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>0</div>
        </div>
      </div>
    </div>
  );
}

export default TeamOverview;