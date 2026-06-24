import React from "react";
import { getUser } from "../utils/auth";
import { useSearch } from "../utils/SearchContext";
import NotificationsDropdown from "./NotificationsDropdown";

function Topbar({ onToggleSidebar }) {
  const { searchQuery, setSearchQuery } = useSearch();
  const user = getUser() || { firstName: "Guest", lastName: "", role: "EMPLOYEE" };

  const fullName = `${user.firstName} ${user.lastName || ""}`.trim();
  const initials = `${user.firstName[0] || ""}${user.lastName ? user.lastName[0] || "" : ""}`.toUpperCase() || "?";
  const roleName = user.role || "EMPLOYEE";

  return (
    <header className="topbar-container">
      <div className="topbar-left">
        <button className="mobile-toggle" onClick={onToggleSidebar} aria-label="Toggle Navigation Sidebar">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="search-wrapper">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search departments, employees, projects or tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="topbar-right">
        <NotificationsDropdown />

        <span className={`role-badge ${roleName.toLowerCase()}`}>
          {roleName}
        </span>

        <div className="user-profile">
          <div className="user-avatar">
            {initials}
          </div>
          <div className="user-info">
            <span className="user-name">{fullName}</span>
            <span className="user-role">{user.email || "No email"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
