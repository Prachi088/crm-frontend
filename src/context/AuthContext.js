import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // FIX: previously only stored token. Now also stores userId and email so
  // LeadList can compare currentUser.id with lead.owner.id for ownership checks.
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user,  setUser]  = useState(() => {
    try {
      const stored = localStorage.getItem("crm-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Called after successful login or register.
  // data = { token, userId, email }  ← new shape from AuthResponse
  const login = (data) => {
    localStorage.setItem("token", data.token);
    const userObj = { id: data.userId, email: data.email };
    localStorage.setItem("crm-user", JSON.stringify(userObj));
    setToken(data.token);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("crm-user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}