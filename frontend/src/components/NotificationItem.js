import React from "react";

function NotificationItem({ notification, onMarkRead, onDelete, formatTime }) {
  const { id, title, message, isRead, createdAt } = notification;

  const handleClick = (e) => {
    // If clicking on delete button, don't trigger mark as read
    if (e.target.closest(".notification-delete-btn")) return;
    if (!isRead) {
      onMarkRead(id);
    }
  };

  return (
    <div
      className={`notification-item-wrapper ${isRead ? "read" : "unread"}`}
      onClick={handleClick}
    >
      <div className="notification-content">
        <span className="notification-title">{title}</span>
        <span className="notification-message">{message}</span>
        <span className="notification-time">{formatTime(createdAt)}</span>
      </div>
      <button
        className="notification-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        title="Delete Notification"
        aria-label="Delete Notification"
      >
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="14"
          height="14"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export default NotificationItem;
