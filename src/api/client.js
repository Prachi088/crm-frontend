const DEFAULT_API_BASE_URL = "http://localhost:3000/api";
const TOKEN_STORAGE_KEY = "token";

export function normalizeApiBaseUrl(value) {
  const raw = (value || DEFAULT_API_BASE_URL).trim();
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

export function getApiBaseUrl() {
  return normalizeApiBaseUrl(process.env.REACT_APP_API_URL);
}

export function hasStoredToken() {
  return Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function normalizePath(path) {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}

async function parseResponseBody(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildApiError(response, data) {
  const fallbackMessage = `Request failed with status ${response.status}`;
  const message =
    data?.message ||
    data?.error ||
    (typeof data === "string" ? data : "") ||
    fallbackMessage;

  const error = new Error(message);
  error.name = "ApiError";
  error.status = response.status;
  error.data = data;
  return error;
}

export async function apiRequest(
  path,
  { method = "GET", body, auth = false } = {}
) {
  const headers = {};
  const token = getStoredToken();

  if (auth) {
    if (!token) {
      const error = new Error("Authentication required");
      error.name = "ApiError";
      error.status = 401;
      throw error;
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${getApiBaseUrl()}${normalizePath(path)}`, {
    method,
    headers,
    body: requestBody,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw buildApiError(response, data);
  }

  return data;
}

export function registerUser(credentials) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: credentials,
  });
}

export function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function fetchLeads() {
  return apiRequest("/leads", {
    auth: hasStoredToken(),
  });
}

export function fetchLeadById(id) {
  return apiRequest(`/leads/${id}`, {
    auth: hasStoredToken(),
  });
}

export function createLead(payload) {
  return apiRequest("/leads", {
    method: "POST",
    body: payload,
    auth: true,
  });
}

export function fetchLeadNotes(leadId) {
  return apiRequest(`/notes/lead/${leadId}`, {
    auth: hasStoredToken(),
  });
}

export function createLeadNote(leadId, payload) {
  return apiRequest(`/notes/lead/${leadId}`, {
    method: "POST",
    body: payload,
    auth: true,
  });
}

export function updateLeadNote(noteId, payload) {
  return apiRequest(`/notes/${noteId}`, {
    method: "PUT",
    body: payload,
    auth: true,
  });
}

export function deleteLeadNote(noteId) {
  return apiRequest(`/notes/${noteId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function fetchCurrentUserProfile() {
  return apiRequest("/users/me", {
    auth: true,
  });
}

export function updateCurrentUserProfile(payload) {
  return apiRequest("/users/me", {
    method: "PUT",
    body: payload,
    auth: true,
  });
}

export function sendChatMessage(payload) {
  return apiRequest("/chat", {
    method: "POST",
    body: payload,
    auth: hasStoredToken(),
  });
}
