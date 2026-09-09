// ---------------------------------------------------------------------------
// Matches server.js:  app.use("/api/company/profile", companyProfileRoutes);
// ---------------------------------------------------------------------------
const API_BASE_URL = "http://localhost:5000/api";
const PROFILE_URL = `${API_BASE_URL}/company/profile`;

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

// GET /api/company/profile -> { company }
export async function getCompanyProfile() {
  const res = await fetch(PROFILE_URL, {
    method: "GET",
    headers: authHeaders(),
  });
  return handle(res);
}

// POST /api/company/profile -> { message, company } (first-time setup)
export async function createCompanyProfile(payload) {
  const res = await fetch(PROFILE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// PUT /api/company/profile -> { message, company } (edit existing)
export async function updateCompanyProfile(payload) {
  const res = await fetch(PROFILE_URL, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
}
