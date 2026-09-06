import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const account = localStorage.getItem("account");

    if (token && role && account) {
      setSession({ role, account: JSON.parse(account) });
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("account");
    navigate("/");
  }

  if (session === null) {
    // Still checking, or nothing found — bounce to landing.
    const hasToken = !!localStorage.getItem("token");
    if (!hasToken) return <Navigate to="/" replace />;
    return null;
  }

  const name =
    session.role === "company" ? session.account.companyName : session.account.name;

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <span className="dashboard-mark">AI Smart Hiring</span>
        <button type="button" className="dashboard-logout" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className="dashboard-body">
        <p className="dashboard-eyebrow">
          {session.role === "company" ? "Company account" : "Candidate account"}
        </p>
        <h1 className="dashboard-headline">Welcome, {name}.</h1>
        <p className="dashboard-note">
          This is a placeholder — build out the real dashboard here.
        </p>
      </main>
    </div>
  );
}
