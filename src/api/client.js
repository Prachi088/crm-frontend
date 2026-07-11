const DEFAULT_API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8080";
const TOKEN_STORAGE_KEY = "token";


export function normalizeApiBaseUrl(value) {
  const raw = (value || DEFAULT_API_BASE_URL).trim();
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

export function getApiBaseUrl() {
  return normalizeApiBaseUrl(
    process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL
  );
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
  return apiRequest("/auth/register", { method: "POST", body: credentials });
}

export function loginUser(credentials) {
  return apiRequest("/auth/login", { method: "POST", body: credentials });
}

// Fetch all leads — used by analytics + chat (cached by Redis)
export function fetchLeads() {
  return apiRequest("/leads", { auth: hasStoredToken() });
}

// Paginated + searchable leads — used by LeadList UI
export function searchLeads({ q = "", status = "ALL", page = 0, size = 20, sort = "createdAt" } = {}) {
  const params = new URLSearchParams({ q, status, page, size, sort });
  return apiRequest(`/leads/search?${params}`, { auth: hasStoredToken() });
}

export function fetchLeadById(id) {
  return apiRequest(`/leads/${id}`, { auth: hasStoredToken() });
}

export function createLead(payload) {
  return apiRequest("/leads", { method: "POST", body: payload, auth: true });
}

export function updateLead(id, payload) {
  return apiRequest(`/leads/${id}`, { method: "PUT", body: payload, auth: true });
}

export function deleteLead(id) {
  return apiRequest(`/leads/${id}`, { method: "DELETE", auth: true });
}

export function fetchLeadNotes(leadId) {
  return apiRequest(`/notes/lead/${leadId}`, { auth: hasStoredToken() });
}

export function createLeadNote(leadId, payload) {
  return apiRequest(`/notes/lead/${leadId}`, { method: "POST", body: payload, auth: true });
}

export function updateLeadNote(noteId, payload) {
  return apiRequest(`/notes/${noteId}`, { method: "PUT", body: payload, auth: true });
}

export function deleteLeadNote(noteId) {
  return apiRequest(`/notes/${noteId}`, { method: "DELETE", auth: true });
}

export function fetchCurrentUserProfile() {
  return apiRequest("/users/me", { auth: true });
}

export function updateCurrentUserProfile(payload) {
  return apiRequest("/users/me", { method: "PUT", body: payload, auth: true });
}

export function sendChatMessage(payload) {
  return apiRequest("/chat", { method: "POST", body: payload, auth: hasStoredToken() });
}

export function fetchDashboardSummary() {
  return apiRequest("/dashboard/summary", { auth: true });
}

export function fetchDashboardActivities() {
  return apiRequest("/dashboard/activities", { auth: true });
}

export function fetchUsers() {
  return apiRequest("/users", { auth: true });
}

export function searchCustomers({ q = "", status = "ALL", page = 0, size = 10, sort = "createdAt" } = {}) {
  const statusParam = status === "ALL" ? "" : status;
  const params = new URLSearchParams({ q, status: statusParam, page, size, sort });
  return apiRequest(`/customers?${params}`, { auth: true });
}

export function fetchCustomers() {
  return apiRequest("/customers", { auth: true });
}

export function fetchCustomerById(id) {
  return apiRequest(`/customers/${id}`, { auth: true });
}

export function createCustomer(payload) {
  return apiRequest("/customers", { method: "POST", body: payload, auth: true });
}

export function updateCustomer(id, payload) {
  return apiRequest(`/customers/${id}`, { method: "PUT", body: payload, auth: true });
}

export function deleteCustomer(id) {
  return apiRequest(`/customers/${id}`, { method: "DELETE", auth: true });
}

export function searchContacts({ q = "", customerId = "", page = 0, size = 10, sort = "createdAt" } = {}) {
  const params = new URLSearchParams({ q, customerId, page, size, sort });
  return apiRequest(`/contacts?${params}`, { auth: true });
}

export function fetchContacts(customerId) {
  const suffix = customerId ? `?customerId=${encodeURIComponent(customerId)}` : "";
  return apiRequest(`/contacts${suffix}`, { auth: true });
}

export function createContact(payload) {
  const customerId = payload?.customerId;
  const path = customerId ? `/customers/${encodeURIComponent(customerId)}/contacts` : "/contacts";
  return apiRequest(path, { method: "POST", body: payload, auth: true });
}

export function updateContact(id, payload) {
  const customerId = payload?.customerId;
  const path = customerId
    ? `/customers/${encodeURIComponent(customerId)}/contacts/${id}`
    : `/contacts/${id}`;
  return apiRequest(path, { method: "PUT", body: payload, auth: true });
}

export function deleteContact(id, customerId) {
  const path = customerId
    ? `/customers/${encodeURIComponent(customerId)}/contacts/${id}`
    : `/contacts/${id}`;
  return apiRequest(path, { method: "DELETE", auth: true });
}

export function searchTasks({ q = "", status = "ALL", sort = "dueDate", page = 0, size = 10 } = {}) {
  const statusParam = status === "ALL" ? "" : status;
  const params = new URLSearchParams({ q, status: statusParam, sort, page, size });
  return apiRequest(`/tasks?${params}`, { auth: true });
}

export function fetchUpcomingTasks() {
  return apiRequest("/tasks/upcoming", { auth: true });
}

export function createTask(payload) {
  return apiRequest("/tasks", { method: "POST", body: payload, auth: true });
}

export function updateTask(id, payload) {
  return apiRequest(`/tasks/${id}`, { method: "PUT", body: payload, auth: true });
}

export function updateTaskStatus(id, status) {
  return apiRequest(`/tasks/${id}/status`, { method: "PATCH", body: { status }, auth: true });
}

export function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, { method: "DELETE", auth: true });
}

export function fetchCustomerNotes(customerId) {
  return apiRequest(`/notes/customer/${customerId}`, { auth: true });
}

export function createCustomerNote(customerId, payload) {
  return apiRequest(`/notes/customer/${customerId}`, { method: "POST", body: payload, auth: true });
}