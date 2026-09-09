// ---------------------------------------------------------------------------
// Matches server.js:  app.use("/api/company/drives", placementDriveRoutes);
// Note: your controllers mix res.send(string) and res.send(object), so this
// helper reads the raw text first and only parses it as JSON if it looks
// like JSON — that way both cases work without changing your backend.
// ---------------------------------------------------------------------------
const API_BASE_URL = "http://localhost:5000/api";
const DRIVES_URL = `${API_BASE_URL}/company/drives`;

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
      data = text; // plain string response, e.g. "Drive created successfully."
    }
  }

  if (!res.ok) {
    const message = typeof data === "string" ? data : data?.message || "Something went wrong.";
    throw new Error(message);
  }

  return data;
}

// GET /api/company/drives -> array of all drives (public)
export async function getAllDrives() {
  const res = await fetch(DRIVES_URL, { method: "GET" });
  return handle(res);
}

// GET /api/company/drives/:id -> single drive (public)
export async function getDrive(id) {
  const res = await fetch(`${DRIVES_URL}/${id}`, { method: "GET" });
  return handle(res);
}

// POST /api/company/drives -> "Drive created successfully." (company only)
export async function createDrive(payload) {
  const res = await fetch(DRIVES_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// PUT /api/company/drives/:id -> updated drive object (company only)
export async function updateDrive(id, payload) {
  const res = await fetch(`${DRIVES_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// DELETE /api/company/drives/:id -> "Drive deleted successfully" (company only)
export async function deleteDrive(id) {
  const res = await fetch(`${DRIVES_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle(res);
}
