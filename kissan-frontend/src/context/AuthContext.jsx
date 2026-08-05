import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("kisan_token");
    if (token) {
      api.get("/auth/me")
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem("kisan_token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(phone, password) {
    const formData = new URLSearchParams();
    formData.append("username", phone);
    formData.append("password", password);

    const response = await fetch("http://localhost:8003/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Login failed");
    }

    const data = await response.json();
    localStorage.setItem("kisan_token", data.access_token);

    const me = await api.get("/auth/me");
    setUser(me);
    return me;
  }

  async function register(userData) {
    const data = await api.post("/auth/register", userData);
    return data;
  }

  function logout() {
    localStorage.removeItem("kisan_token");
    setUser(null);
  }

  const value = {
    user,
    isLoggedIn: !!user,
    role: user?.role || null,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}