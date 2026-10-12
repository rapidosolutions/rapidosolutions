import { createContext, useContext, useEffect, useState } from "react";
import { getAdminSession, loginAdmin as apiLogin, logoutAdmin as apiLogout } from "../utils/blogApi";

const PortalContext = createContext(null);

export function PortalProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminSession()
      .then((data) => {
        if (active && data?.admin) {
          setAdmin(data.admin);
        }
      })
      .catch(() => {
        if (active) setAdmin(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    setError("");
    try {
      const data = await apiLogin(credentials);
      setAdmin(data.admin);
      return data.admin;
    } catch (err) {
      const message = err.message || "Failed to sign in. Please verify your credentials.";
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setAdmin(null);
    }
  };

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("rapido_portal_theme") || "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("rapido_portal_theme", next);
      return next;
    });
  };

  const isDark = theme === "dark";

  return (
    <PortalContext.Provider value={{ admin, loading, error, setError, login, logout, theme, toggleTheme, isDark }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return context;
}
