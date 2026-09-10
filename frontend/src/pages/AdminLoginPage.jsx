import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { loginAdmin, persistAdminSession } from "../api/admin";
import "./AdminLoginPage.css";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  // Already logged in as admin? Skip straight to the dashboard.
  const alreadyAdmin =
    !!localStorage.getItem("token") && localStorage.getItem("role") === "admin";
  if (alreadyAdmin) return <Navigate to="/admin/dashboard" replace />;

  function updateField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const data = await loginAdmin(fields);
      persistAdminSession(data);
      navigate("/admin/dashboard");
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  return (
    <div className="admin-login-shell">
      <main className="admin-login-panel">
        <p className="admin-login-eyebrow">Admin</p>
        <h1 className="admin-login-headline">Sign in to the console.</h1>
        <p className="admin-login-note">
          Review new companies and approve or reject their listings.
        </p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label className="admin-login-field">
            <span>Email</span>
            <input
              type="email"
              value={fields.email}
              required
              onChange={(e) => updateField("email", e.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="admin-login-field">
            <span>Password</span>
            <input
              type="password"
              value={fields.password}
              required
              onChange={(e) => updateField("password", e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {status.error && <p className="admin-login-error">{status.error}</p>}

          <button className="admin-login-submit" type="submit" disabled={status.loading}>
            {status.loading ? "Please wait…" : "Log in"}
          </button>
        </form>
      </main>
    </div>
  );
}
