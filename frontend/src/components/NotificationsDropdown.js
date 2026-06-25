import React, { useState, useEffect, useRef } from "react";
import NotificationItem from "./NotificationItem";
import { getToken } from "../utils/auth";
import { API_URL } from "../config/api";

function NotificationsDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Fetch notifications on mount (representing user login/app mount)
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications when the dropdown is opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const token = getToken();
      if (!token) return;

      // Update state instantly first (optimistic update)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );

      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        // Rollback state if server request fails
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      fetchNotifications();
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = getToken();
      if (!token) return;

      // Update state instantly first (optimistic update)
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      const res = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        // Rollback state if server request fails
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      fetchNotifications();
    }
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    if (diffMs < 0) return "Just now";
    
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "Just now";
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notifications-wrapper" ref={dropdownRef}>
      <button
        className="notifications-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle Notifications Dropdown"
      >
        <span style={{ fontSize: "16px" }}>🔔</span>
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="notifications-empty-state">
                No notifications available
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                  formatTime={getRelativeTime}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsDropdown;
