// ---------------------------------------------------------------------------
// Matches server.js:
//   app.use("/api/admin/auth", adminAuthRoutes);
//   app.use("/api/admin", adminRoutes);
// ---------------------------------------------------------------------------
const API_BASE_URL = "http://localhost:5000/api";
const AUTH_URL = `${API_BASE_URL}/admin/auth`;
const ADMIN_URL = `${API_BASE_URL}/admin`;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Your controllers send { message: "..." } on every error path
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}

// POST /api/admin/auth/login -> { message, token, admin: {...} }
export async function loginAdmin(payload) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// Stores the session the same way persistSession() in api/auth.js does,
// so Dashboard-style role checks (localStorage token/role/account) keep working.
export function persistAdminSession(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", "admin");
  localStorage.setItem("account", JSON.stringify(data.admin));
}

// GET /api/admin/companies/pending -> { count, companies }
export async function getPendingCompanies() {
  const res = await fetch(`${ADMIN_URL}/companies/pending`, {
    method: "GET",
    headers: authHeaders(),
  });
  const data = await handle(res);
  return data.companies;
}

// PATCH /api/admin/companies/:id/approve -> { message, company }
export async function approveCompany(id) {
  const res = await fetch(`${ADMIN_URL}/companies/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handle(res);
}

// PATCH /api/admin/companies/:id/reject -> { message, company }
export async function rejectCompany(id, rejectionReason) {
  const res = await fetch(`${ADMIN_URL}/companies/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ rejectionReason }),
  });
  return handle(res);
}
