import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

function ProjectProgressChart({ projects = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    const labels = projects.map(p => p.name);
    const data = projects.map(p => p.progressPercentage);

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Completion %",
            data: data,
            backgroundColor: "#0F766E", // Teal matching var(--primary)
            borderRadius: 6,
            borderWidth: 0,
            barThickness: 16
          }
        ]
      },
      options: {
        indexAxis: "y", // makes it a horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: {
              color: "var(--border-color)",
              drawBorder: false
            },
            ticks: {
              callback: value => `${value}%`,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                weight: "500",
                size: 11
              },
              color: "var(--text-muted)"
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                weight: "600",
                size: 12
              },
              color: "var(--text-main)"
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
                const project = projects[context.dataIndex];
                return ` Progress: ${context.raw}% (${project.doneTasks}/${project.totalTasks} Tasks)`;
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
  }, [projects]);

  return (
    <div className="dashboard-section" style={{ flex: 1, minWidth: "320px" }}>
      <div className="section-header">
        <h2>Project Progress</h2>
      </div>
      <div style={{ position: "relative", height: "300px", width: "100%" }}>
        {projects.length === 0 ? (
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v3.776" />
            </svg>
            <span>No projects found</span>
          </div>
        ) : null}
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default ProjectProgressChart;
