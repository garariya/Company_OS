import React from "react";

function AnalyticsCards({ cards }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="cards-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="stat-card" style={{ animation: `fadeIn 0.3s ease forwards ${idx * 0.1}s` }}>
          <div className="stat-card-details">
            <h3>{card.title}</h3>
            <div className="stat-value">{card.value}</div>
            {card.subtitle && (
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                {card.subtitle}
              </div>
            )}
          </div>
          <div className={`stat-card-icon ${card.colorClass || "primary"}`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AnalyticsCards;
