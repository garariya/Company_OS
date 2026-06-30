import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [backendReady, setBackendReady] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(true);
  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);

  // Wake up backend
  useEffect(() => {
    let interval;

    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/`);

        if (res.ok) {
          setBackendReady(true);
          setCheckingBackend(false);

          clearInterval(interval);
        }
      } catch (err) {
        console.log("Waiting for backend...");
      }
    };

    checkBackend();

    interval = setInterval(checkBackend, 2000);

    return () => clearInterval(interval);
  }, []);

  // Show additional message after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!backendReady) {
        setShowLongWaitMessage(true);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [backendReady]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!backendReady) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (data.user.role === "MANAGER") {
        navigate("/manager", { replace: true });
      } else {
        navigate("/employee", { replace: true });
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1 className="auth-title">Welcome Back</h1>

        <p className="auth-subtitle">
          Log in to access your Company OS workspace
        </p>

        {checkingBackend && (
          <div
            style={{
              background: "#fff8e1",
              border: "1px solid #ffe082",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              color: "#8a6d3b",
              textAlign: "center",
              fontSize: "14px"
            }}
          >
            <strong>🚀 Initializing CompanyOS...</strong>

            <br /><br />

            Connecting to the backend server.

            <br />

            Since this demo is hosted on Render's free tier,
            the first startup may take around <b>30–40 seconds</b>.

            {showLongWaitMessage && (
              <>
                <br /><br />
                Thank you for waiting! Once started,
                the application will respond normally.
              </>
            )}
          </div>
        )}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="auth-form-group">
            <label>Email Address</label>

            <input
              className="auth-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="auth-form-group">
            <label>Password</label>

            <input
              className="auth-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || !backendReady}
          >
            {loading
              ? "Logging In..."
              : checkingBackend
              ? "Starting Server..."
              : "Log In"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="auth-link"
          >
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;