import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Admin from "./pages/Admin";
import Manager from "./pages/Manager";
import Employee from "./pages/Employee";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/manager" element={<Manager />} />
        <Route path="/employee" element={<Employee />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;