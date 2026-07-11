import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { normalizeRole, USER_ROLES } from "../constants/crm";

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY  = "crm-user";
const TERMS_STORAGE_PREFIX = "crm-terms-accepted";

function getTermsStorageKey(userLike) {
  const accountKey = userLike?.userId ?? userLike?.id ?? userLike?.email;
  return accountKey ? `${TERMS_STORAGE_PREFIX}:${accountKey}` : null;
}

function hasStoredTermsAcceptance(userLike) {
  try {
    const key = getTermsStorageKey(userLike);
    return key ? localStorage.getItem(key) === "true" : false;
  } catch {
    return false;
  }
}

function normalizeUser(userLike) {
  if (!userLike) return null;

  const userId = userLike.userId ?? userLike.id ?? null;
  const email  = userLike.email ?? "";
  const role   = normalizeRole(userLike.role);
  const termsAccepted =
    userLike.termsAccepted ??
    userLike.acceptedTerms ??
    userLike.termsAndConditionsAccepted ??
    false;

  if (!userId && !email) return null;

  const baseUser = { id: userId, userId, email, role };
  return {
    ...baseUser,
    termsAccepted: Boolean(termsAccepted) || hasStoredTermsAcceptance(baseUser),
  };
}

function normalizeAuthPayload(payload) {
  return {
    token: payload?.token ?? null,
    user:  normalizeUser(payload?.user ?? payload),
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
  const [user,  setUser]  = useState(readStoredUser);

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

  const acceptTerms = useCallback(() => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const acceptedUser = { ...currentUser, termsAccepted: true };
      const key = getTermsStorageKey(acceptedUser);
      if (key) localStorage.setItem(key, "true");
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(acceptedUser));
      return acceptedUser;
    });
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token,
    role: user?.role ?? USER_ROLES.SALES_REP,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isManager: user?.role === USER_ROLES.MANAGER,
    isSalesRep: user?.role === USER_ROLES.SALES_REP,
    canManageCustomers: [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user?.role),
    canManageTasks: [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user?.role),
    canManageContacts: Boolean(user),
    login,
    logout,
    acceptTerms,
  }), [token, user, login, logout, acceptTerms]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
