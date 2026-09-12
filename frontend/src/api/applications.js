// ---------------------------------------------------------------------------
// Matches server.js:  app.use("/api/applications", applicationRoutes);
// Same handle() pattern as api/placementDrives.js — reads raw text first and
// only parses as JSON if it looks like JSON.
// ---------------------------------------------------------------------------
const API_BASE_URL = "http://localhost:5000/api";
const APPLICATIONS_URL = `${API_BASE_URL}/applications`;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text; // plain string response
    }
  }

  if (!res.ok) {
    const message = typeof data === "string" ? data : data?.message || "Something went wrong.";
    throw new Error(message);
  }

  return data;
}

// POST /api/applications/:jobId -> candidate applies for a job (candidate only)
export async function applyForJob(jobId, payload = {}) {
  const res = await fetch(`${APPLICATIONS_URL}/${jobId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// GET /api/applications/my -> { count, applications } for the logged-in candidate
export async function getMyApplications() {
  const res = await fetch(`${APPLICATIONS_URL}/my`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handle(res);
}

// GET /api/applications/job/:jobId -> { count, applications } (company only)
export async function getJobApplicants(jobId) {
  const res = await fetch(`${APPLICATIONS_URL}/job/${jobId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handle(res);
}

// PUT /api/applications/:applicationId/status -> updated application (company only)
export async function updateApplicationStatus(applicationId, status) {
  const res = await fetch(`${APPLICATIONS_URL}/${applicationId}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handle(res);
}
