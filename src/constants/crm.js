export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SALES_REP: "SALES_REP",
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.MANAGER]: "Manager",
  [USER_ROLES.SALES_REP]: "Sales Representative",
};

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

export const LEAD_STATUS_COLORS = {
  New: { color: "#6366F1", bg: "#EEF2FF", text: "#4338CA" },
  Contacted: { color: "#0EA5E9", bg: "#E0F2FE", text: "#0369A1" },
  Qualified: { color: "#F97316", bg: "#FFF7ED", text: "#C2410C" },
  "Proposal Sent": { color: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8" },
  Negotiation: { color: "#F59E0B", bg: "#FEF3C7", text: "#92400E" },
  Won: { color: "#22C55E", bg: "#F0FDF4", text: "#15803D" },
  Lost: { color: "#F43F5E", bg: "#FFF1F2", text: "#BE123C" },
};

const LEGACY_STATUS_MAP = {
  PROSPECT: "New",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal Sent",
  "CLOSED WON": "Won",
  "CLOSED LOST": "Lost",
};

export function normalizeLeadStatus(status) {
  return LEGACY_STATUS_MAP[status] || status || "New";
}

export function normalizeRole(roleLike) {
  const raw = String(roleLike || USER_ROLES.SALES_REP)
    .replace(/^ROLE_/i, "")
    .replace(/\s+/g, "_")
    .replace(/-/g, "_")
    .toUpperCase();

  if (raw === "ADMIN") return USER_ROLES.ADMIN;
  if (raw === "MANAGER") return USER_ROLES.MANAGER;
  if (raw === "SALES" || raw === "SALES_REP" || raw === "SALES_REPRESENTATIVE") {
    return USER_ROLES.SALES_REP;
  }

  return USER_ROLES.SALES_REP;
}

export function hasRole(user, allowedRoles = []) {
  if (!allowedRoles.length) return true;
  if (!user) return false;
  return allowedRoles.includes(normalizeRole(user?.role));
}
