import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

function EmployeeWorkloadChart({ workload = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    // Sort by task count descending so overloaded employees appear first
    const sortedWorkload = [...workload].sort((a, b) => b.assignedTasksCount - a.assignedTasksCount);
    
    // Limit to top 10 to keep the chart clean on large organizations
    const topWorkload = sortedWorkload.slice(0, 10);

    const labels = topWorkload.map(w => w.name);
    const data = topWorkload.map(w => w.assignedTasksCount);
    
    // Dynamically assign colors based on workload
    const backgroundColors = topWorkload.map(w => {
      if (w.assignedTasksCount >= 10) return "#DC2626"; // Red (Overloaded)
      if (w.assignedTasksCount >= 5) return "#D97706";  // Orange (Busy)
      return "#0D9488";                                 // Teal (Normal)
    });

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Tasks Count",
            data: data,
            backgroundColor: backgroundColors,
            borderRadius: 6,
            borderWidth: 0,
            barThickness: 24
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                weight: "600",
                size: 11
              },
              color: "var(--text-main)"
            }
          },
          y: {
            min: 0,
            suggestedMax: 5,
            grid: {
              color: "var(--border-color)",
              drawBorder: false
            },
            ticks: {
              stepSize: 2,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                weight: "500",
                size: 11
              },
              color: "var(--text-muted)"
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const count = context.raw || 0;
                let status = "Normal";
                if (count >= 10) status = "Overloaded";
                else if (count >= 5) status = "Busy";
                return ` Tasks: ${count} (${status})`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [workload]);

  return (
    <div className="dashboard-section" style={{ flex: 1, minWidth: "320px" }}>
      <div className="section-header">
        <h2>Employee Workload (Top 10)</h2>
      </div>
      <div style={{ position: "relative", height: "300px", width: "100%" }}>
        {workload.length === 0 ? (
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <span>No employees found</span>
          </div>
        ) : null}
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default EmployeeWorkloadChart;
