import React from "react";

function DepartmentAnalytics({ departments = [] }) {
  // Find maximum employee count to scale the relative progress bars
  const maxEmployees = departments.reduce((max, d) => (d.employeeCount > max ? d.employeeCount : max), 1);

  return (
    <div className="dashboard-section" style={{ flex: 1, minWidth: "300px" }}>
      <div className="section-header">
        <h2>Department Employee Counts</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "8px 0" }}>
        {departments.length === 0 ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "var(--text-muted)",
            fontSize: "14px",
            minHeight: "150px"
          }}>
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48" style={{ marginBottom: "8px", opacity: 0.5 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>No departments found</span>
          </div>
        ) : (
          departments.map((dept, idx) => {
            const percentage = Math.round((dept.employeeCount / maxEmployees) * 100);
            
            return (
              <div key={dept.id || idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>
                    {dept.name}
                  </span>
                  <span className="badge" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)", fontWeight: "700", fontSize: "12px" }}>
                    {dept.employeeCount} {dept.employeeCount === 1 ? "Employee" : "Employees"}
                  </span>
                </div>
                
                {/* Progress bar representing weight */}
                <div style={{
                  height: "8px",
                  width: "100%",
                  backgroundColor: "var(--border-color)",
                  borderRadius: "4px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: "100%",
                    backgroundColor: "var(--primary)",
                    borderRadius: "4px",
                    transition: "width 0.5s ease-out"
                  }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default DepartmentAnalytics;
