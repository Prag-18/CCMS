/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser());
  const [token, setToken] = useState(localStorage.getItem("token"));

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
