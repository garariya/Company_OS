export const getToken = () => {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
}

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    try {
      await fetch("http://localhost:5001/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (e) {
      console.error("Failed to invalidate session on backend:", e);
    }
  }
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}