import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const user = getUser();

  // If not authenticated, redirect to login page
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not authorized, redirect to their role's home dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (user.role === "MANAGER") {
      return <Navigate to="/manager" replace />;
    } else {
      return <Navigate to="/employee" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
