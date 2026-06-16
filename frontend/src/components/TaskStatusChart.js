import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

function TaskStatusChart({ todo = 0, inProgress = 0, done = 0 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    
    // Check if there is data to display
    const total = todo + inProgress + done;
    
    const chartData = {
      labels: ["To Do", "In Progress", "Done"],
      datasets: [
        {
          data: total > 0 ? [todo, inProgress, done] : [1, 1, 1], // fallback if zero
          backgroundColor: total > 0 
            ? ["#94A3B8", "#F59E0B", "#10B981"]
            : ["#E2E8F0", "#E2E8F0", "#E2E8F0"],
          borderWidth: 2,
          borderColor: "var(--bg-card)",
          hoverOffset: 4
        }
      ]
    };

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 15,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                weight: "600",
                size: 12
              },
              color: "var(--text-main)"
            }
          },
          tooltip: {
            enabled: total > 0,
            callbacks: {
              label: function(context) {
                const label = context.label || "";
                const val = context.raw || 0;
                return ` ${label}: ${val} tasks`;
              }
            }
          }
        },
        cutout: "70%"
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [todo, inProgress, done]);

  return (
    <div className="dashboard-section" style={{ flex: 1, minWidth: "280px" }}>
      <div className="section-header">
        <h2>Task Status Distribution</h2>
      </div>
      <div style={{ position: "relative", height: "260px", width: "100%" }}>
        {(todo === 0 && inProgress === 0 && done === 0) ? (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "var(--text-muted)",
            fontSize: "14px"
          }}>
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48" style={{ marginBottom: "8px", opacity: 0.5 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>No tasks recorded</span>
          </div>
        ) : null}
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default TaskStatusChart;
