/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

// DEV: permanent admin session — no login required
const DEV_USER = { id: 1, name: "Admin User", role: "ADMIN" };
const DEV_TOKEN = "dev-bypass-token";

// Seed localStorage immediately so axios interceptors always attach the token
if (!localStorage.getItem("token")) {
  localStorage.setItem("token", DEV_TOKEN);
}
if (!localStorage.getItem("user")) {
  localStorage.setItem("user", JSON.stringify(DEV_USER));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEV_USER);
  const [token, setToken] = useState(DEV_TOKEN);

  const login = (data) => {
    // Backward compatible: login(tokenString)
    if (typeof data === "string") {
      localStorage.setItem("token", data);
      setToken(data);
      return;
    }

    const nextToken = data?.token;
    const nextOfficer = data?.officer || null;

    if (nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
    }

    localStorage.setItem("user", JSON.stringify(nextOfficer || {}));
    setUser(nextOfficer);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
