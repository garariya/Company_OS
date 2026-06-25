import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import Manager from "./pages/Manager";
import Employee from "./pages/Employee";
import ProjectTeamPage from "./pages/ProjectTeamPage";
import Chat from "./pages/Chat";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import { SearchProvider } from "./utils/SearchContext";

function App() {
  return (
    <BrowserRouter>
      <SearchProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                  <Manager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                  <Employee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project-teams"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
                  <ProjectTeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
                  <Chat />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;