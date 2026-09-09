// ---------------------------------------------------------------------------
// Matches server.js:  app.use("/api/users/profile", candidateRoutes);
// ---------------------------------------------------------------------------
const API_BASE_URL = "http://localhost:5000/api";
const PROFILE_URL = `${API_BASE_URL}/users/profile`;

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
    throw new Error(data.message || data.error || "Something went wrong. Please try again.");
  }
  return data;
}

// GET /api/users/profile -> { candidate }
export async function getCandidateProfile() {
  const res = await fetch(PROFILE_URL, { method: "GET", headers: authHeaders() });
  return handle(res);
}

// POST /api/users/profile -> { message, candidate } (first-time setup)
export async function createCandidateProfile(payload) {
  const res = await fetch(PROFILE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// PUT /api/users/profile -> { message, candidate }
export async function updateCandidateProfile(payload) {
  const res = await fetch(PROFILE_URL, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
}
