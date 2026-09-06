import { useState } from "react";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import { registerAccount, loginAccount, persistSession } from "../api/auth";
import "./AuthPage.css";

const COPY = {
  student: {
    eyebrow: "For candidates",
    headline: "Your skills, not your résumé, open the door.",
    note: "Build a profile once. Every company on the platform reads it the same way.",
  },
  company: {
    eyebrow: "For companies",
    headline: "Hire on proof of skill, not keyword luck.",
    note: "Post a role, and let the platform surface candidates who can actually do the work.",
  },
};

const initialFields = {
  company: { companyName: "", email: "", password: "", phone: "" },
  student: { name: "", email: "", password: "" },
};

export default function AuthPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [fields, setFields] = useState(initialFields);
  const [status, setStatus] = useState({ loading: false, error: "" });

  if (role !== "student" && role !== "company") {
    return <Navigate to="/" replace />;
  }

  const copy = COPY[role];
  const current = fields[role];

  function updateField(key, value) {
    setFields((prev) => ({
      ...prev,
      [role]: { ...prev[role], [key]: value },
    }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setStatus({ loading: false, error: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const payload =
        role === "company"
          ? {
              companyName: current.companyName,
              email: current.email,
              password: current.password,
              phone: current.phone,
            }
          : {
              name: current.name,
              email: current.email,
              password: current.password,
            };

      let sessionData;

      if (mode === "signup") {
        await registerAccount(role, payload);
        // Registration doesn't return a token in your controllers,
        // so log the new account in right after.
        sessionData = await loginAccount(role, {
          email: current.email,
          password: current.password,
        });
      } else {
        sessionData = await loginAccount(role, {
          email: current.email,
          password: current.password,
        });
      }

      persistSession(role, sessionData);
      navigate("/dashboard");
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  const otherRole = role === "student" ? "company" : "student";

  return (
    <div className={`auth-shell auth-shell--${role}`}>
      <aside className="auth-narrative">
        <Link to={`/auth/${otherRole}`} className="auth-back">
          {role === "student" ? "Hiring instead? →" : "Looking for work instead? →"}
        </Link>

        <div className="auth-narrative-body">
          <p className="auth-eyebrow">{copy.eyebrow}</p>
          <h1 className="auth-headline">{copy.headline}</h1>
          <p className="auth-note">{copy.note}</p>
        </div>

        <div className="auth-role-mark">{role === "student" ? "01" : "02"}</div>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "auth-tab is-active" : "auth-tab"}
              onClick={() => switchMode("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === "signup" ? "auth-tab is-active" : "auth-tab"}
              onClick={() => switchMode("signup")}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && role === "company" && (
              <Field
                label="Company name"
                value={current.companyName}
                onChange={(v) => updateField("companyName", v)}
                required
              />
            )}

            {mode === "signup" && role === "student" && (
              <Field
                label="Full name"
                value={current.name}
                onChange={(v) => updateField("name", v)}
                required
              />
            )}

            <Field
              label="Email"
              type="email"
              value={current.email}
              onChange={(v) => updateField("email", v)}
              required
            />

            <Field
              label="Password"
              type="password"
              value={current.password}
              onChange={(v) => updateField("password", v)}
              required
            />

            {mode === "signup" && role === "company" && (
              <Field
                label="Phone (optional)"
                type="tel"
                value={current.phone}
                onChange={(v) => updateField("phone", v)}
              />
            )}

            {status.error && <p className="auth-error">{status.error}</p>}

            <button className="auth-submit" type="submit" disabled={status.loading}>
              {status.loading
                ? "Please wait…"
                : mode === "login"
                ? "Log in"
                : "Create account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={type === "password" ? "current-password" : "on"}
      />
    </label>
  );
}
