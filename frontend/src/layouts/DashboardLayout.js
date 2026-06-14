import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout-container">
      {/* Background Dim Overlay for Mobile Sidebar Drawer */}
      <div
        className={`mobile-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="main-wrapper">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="content-area">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
