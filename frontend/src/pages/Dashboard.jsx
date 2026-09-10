import { useEffect, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { getCompanyProfile } from "../api/companyProfile";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const account = localStorage.getItem("account");

    if (token && role && account) {
      setSession({ role, account: JSON.parse(account) });
    }
  }, []);

  useEffect(() => {
    if (!session || session.role !== "company") return;

    (async () => {
      try {
        const data = await getCompanyProfile();
        setVerification(data.company?.verificationStatus || "pending");
      } catch {
        setVerification("pending");
      }
    })();
  }, [session]);

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
        <div className="dashboard-header-right">
          <span className="dashboard-role-badge">
            {session.role === "company" ? "Company" : "Candidate"}
          </span>
          <button type="button" className="dashboard-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-body">
        <div className="dashboard-content-box">
          <section className="dashboard-hero">
            <p className="dashboard-eyebrow">
              {session.role === "company" ? "Company account" : "Candidate account"}
            </p>
            <h1 className="dashboard-headline">Welcome, {name}.</h1>
            <p className="dashboard-note">
              {session.role === "company"
                ? "Manage your company profile and placement drives from here."
                : "Your journey to a great role starts here."}
            </p>
          </section>

          <section className="dashboard-grid">
            {session.role === "company" && (
              <Link to="/company/profile" className="dashboard-card">
                <span className="dashboard-card-eyebrow">Company</span>
                <h2 className="dashboard-card-title">Company profile</h2>
                <p className="dashboard-card-note">
                  View and edit your company details, verification status, and about section.
                </p>
                <span className="dashboard-card-cta">Open →</span>
              </Link>
            )}

            {session.role === "company" ? (
              verification === "approved" ? (
                <Link to="/company/drives" className="dashboard-card">
                  <span className="dashboard-card-eyebrow">Company</span>
                  <h2 className="dashboard-card-title">Placement drives</h2>
                  <p className="dashboard-card-note">
                    Create and manage your hiring drives.
                  </p>
                  <span className="dashboard-card-cta">Open →</span>
                </Link>
              ) : (
                <div className="dashboard-card dashboard-card--locked">
                  <div className="dashboard-card-lockrow">
                    <span className="dashboard-card-eyebrow">Company</span>
                    <span
                      className={`dashboard-card-lockbadge ${
                        verification === "rejected" ? "dashboard-card-lockbadge--rejected" : ""
                      }`}
                    >
                      {verification === "rejected" ? "Rejected" : "Pending verification"}
                    </span>
                  </div>
                  <h2 className="dashboard-card-title">Placement drives</h2>
                  <p className="dashboard-card-note">
                    {verification === "rejected"
                      ? "Your admin verification was rejected. Update your company profile and resubmit to unlock drive creation."
                      : "Your account is awaiting admin verification. Once approved, you'll be able to create and manage placement drives here."}
                  </p>
                </div>
              )
            ) : (
              <>
                <Link to="/candidate/profile" className="dashboard-card">
                  <span className="dashboard-card-eyebrow">Candidate</span>
                  <h2 className="dashboard-card-title">My profile</h2>
                  <p className="dashboard-card-note">
                    Add your education, skills, and projects.
                  </p>
                  <span className="dashboard-card-cta">Open →</span>
                </Link>
                <Link to="/drives" className="dashboard-card">
                  <span className="dashboard-card-eyebrow">Candidate</span>
                  <h2 className="dashboard-card-title">Browse drives</h2>
                  <p className="dashboard-card-note">
                    Explore open drives and apply.
                  </p>
                  <span className="dashboard-card-cta">Open →</span>
                </Link>
                <Link to="/applications" className="dashboard-card">
                  <span className="dashboard-card-eyebrow">Candidate</span>
                  <h2 className="dashboard-card-title">My applications</h2>
                  <p className="dashboard-card-note">
                    Track the status of drives you've applied to.
                  </p>
                  <span className="dashboard-card-cta">Open →</span>
                </Link>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
