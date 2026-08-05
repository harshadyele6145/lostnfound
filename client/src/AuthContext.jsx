import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const savedUser = localStorage.getItem("campusfind_user");
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
};

const getStoredToken = () => localStorage.getItem("campusfind_token");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (typeof window !== "undefined" ? getStoredUser() : null));
  const [token, setToken] = useState(() => (typeof window !== "undefined" ? getStoredToken() : null));

  useEffect(() => {
    if (token) {
      localStorage.setItem("campusfind_token", token);
    } else {
      localStorage.removeItem("campusfind_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("campusfind_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("campusfind_user");
    }
  }, [user]);

  const login = ({ token: newToken, user: newUser }) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
