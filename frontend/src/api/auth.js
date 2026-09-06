// ---------------------------------------------------------------------------
// ADJUST THIS to match how you mounted the routers in your app.js, e.g.:
//   app.use("/api/company", companyAuthRoutes);
//   app.use("/api/users", userAuthRoutes);
// ---------------------------------------------------------------------------
const API_BASE_URL = "http://localhost:5000/api";

const ENDPOINTS = {
  company: {
    register: `${API_BASE_URL}/company/register`,
    login: `${API_BASE_URL}/company/login`,
  },
  student: {
    register: `${API_BASE_URL}/users/register`,
    login: `${API_BASE_URL}/users/login`,
  },
};

async function request(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Your controllers send { message: "..." } on every error path
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

// role: "company" | "student"
export function registerAccount(role, payload) {
  return request(ENDPOINTS[role].register, payload);
}

export function loginAccount(role, payload) {
  return request(ENDPOINTS[role].login, payload);
}

// Company response -> { message, token, company: {...} }
// Student response -> { message, token, user: {...} }
export function persistSession(role, data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", role);
  localStorage.setItem(
    "account",
    JSON.stringify(role === "company" ? data.company : data.user)
  );
}
