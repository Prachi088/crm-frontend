import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "crm-user";

function normalizeUser(userLike) {
  if (!userLike) return null;

  const userId = userLike.userId ?? userLike.id ?? null;
  const email = userLike.email ?? "";

  if (!userId && !email) {
    return null;
  }

  return {
    id: userId,
    userId,
    email,
  };
}

function normalizeAuthPayload(payload) {
  return {
    token: payload?.token ?? null,
    user: normalizeUser(payload?.user ?? payload),
  };
}

function readStoredUser() {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? normalizeUser(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback((payload) => {
    const normalized = normalizeAuthPayload(payload);

    if (normalized.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, normalized.token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    if (normalized.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized.user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }

    setToken(normalized.token);
    setUser(normalized.user);

    return normalized;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [token, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
