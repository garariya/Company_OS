// global fetch interceptor to handle token refresh automatically
import { API_URL } from "../config/api";

const originalFetch = window.fetch;

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((cb) => cb(newAccessToken));
  refreshSubscribers = [];
}

window.fetch = async function (url, options = {}) {
  // Only intercept requests to our backend API
  const isApiRequest =
    typeof url === "string" &&
    (url.startsWith(`${API_URL}/api`) || url.startsWith("/api"));

  if (!isApiRequest) {
    return originalFetch(url, options);
  }

  // Ensure headers object exists
  options.headers = options.headers || {};

  // Helper to inject the current access token
  const injectToken = (headers, token) => {
    if (headers instanceof Headers) {
      headers.set("Authorization", `Bearer ${token}`);
    } else if (Array.isArray(headers)) {
      const authIdx = headers.findIndex(([key]) => key.toLowerCase() === "authorization");
      if (authIdx !== -1) {
        headers[authIdx] = ["Authorization", `Bearer ${token}`];
      } else {
        headers.push(["Authorization", `Bearer ${token}`]);
      }
    } else {
      headers["Authorization"] = `Bearer ${token}`;
    }
  };

  // Get current token from storage
  const currentToken = localStorage.getItem("accessToken") || localStorage.getItem("token");

  // Inject token if it exists
  if (currentToken) {
    injectToken(options.headers, currentToken);
  }

  try {
    const response = await originalFetch(url, options);

    // If unauthorized and it's not an auth request (like login/signup/refresh)
    if (
      response.status === 401 &&
      !url.includes("/api/auth/login") &&
      !url.includes("/api/auth/signup") &&
      !url.includes("/api/auth/refresh")
    ) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token available, logout user
        handleLogoutRedirect();
        return response;
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newAccessToken) => {
            injectToken(options.headers, newAccessToken);
            resolve(originalFetch(url, options));
          });
        });
      }

      isRefreshing = true;

      // Call refresh endpoint to get new token
      try {
        const refreshRes = await originalFetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData.accessToken;
          const newRefreshToken = refreshData.refreshToken;

          // Store new tokens
          localStorage.setItem("token", newAccessToken); // legacy key
          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          onRefreshed(newAccessToken);
          isRefreshing = false;

          // Retry the original request
          injectToken(options.headers, newAccessToken);
          return originalFetch(url, options);
        } else {
          // Refresh token invalid or expired
          isRefreshing = false;
          handleLogoutRedirect();
          return response;
        }
      } catch (refreshErr) {
        console.error("Refresh token request failed:", refreshErr);
        isRefreshing = false;
        handleLogoutRedirect();
        return response;
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

function handleLogoutRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // Only redirect if not already on the login page
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}
