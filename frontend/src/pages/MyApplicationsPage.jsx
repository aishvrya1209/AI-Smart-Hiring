import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyApplications } from "../api/applications";
import "./MyApplicationsPage.css";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SECTIONS = [
  { key: "Shortlisted", title: "Shortlisted", match: (s) => s === "Shortlisted" },
  { key: "Rejected", title: "Rejected", match: (s) => s === "Rejected" },
  {
    key: "Other",
    title: "In progress",
    match: (s) => s !== "Shortlisted" && s !== "Rejected",
  },
];

function ApplicationCard({ app }) {
  return (
    <div className="myapps-card">
      <div className="myapps-card-top">
        <span className={`myapps-status myapps-status--${app.status}`}>
          {app.status}
        </span>
        <span className="myapps-applied-on">
          Applied {formatDate(app.appliedAt || app.createdAt)}
        </span>
      </div>

      {app.jobId?.companyId?.companyName && (
        <p className="myapps-card-company">{app.jobId.companyId.companyName}</p>
      )}

      {app.jobId ? (
        <Link to={`/drives/${app.jobId._id}`} className="myapps-card-title">
          {app.jobId.title}
        </Link>
      ) : (
        <span className="myapps-card-title myapps-card-title--removed">
          Drive no longer available
        </span>
      )}

      {app.jobId && (
        <p className="myapps-card-meta">
          {app.jobId.jobRole} · {app.jobId.location}
        </p>
      )}

      <p className="myapps-card-round">Round {app.currentRound || 1}</p>
    </div>
  );
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyApplications();
        setApplications(data.applications || []);
        setStatus({ loading: false, error: "" });
      } catch (err) {
        setStatus({ loading: false, error: err.message });
      }
    })();
  }, []);

  return (
    <div className="myapps-shell">
      <header className="myapps-header">
        <Link to="/" className="myapps-mark">
          AI Smart Hiring
        </Link>
        <Link to="/dashboard" className="myapps-back">
          Dashboard →
        </Link>
      </header>

      <main className="myapps-body">
        <p className="myapps-eyebrow">Track your progress</p>
        <h1 className="myapps-headline">My applications.</h1>

        {status.error && <p className="myapps-error">{status.error}</p>}

        {status.loading ? (
          <p className="myapps-loading">Loading…</p>
        ) : applications.length === 0 ? (
          <div className="myapps-empty">
            <p>You haven't applied to any drives yet.</p>
            <Link to="/drives" className="myapps-empty-cta">
              Browse open drives →
            </Link>
          </div>
        ) : (
          <div className="myapps-sections">
            {SECTIONS.map((section) => {
              const items = applications.filter((app) => section.match(app.status));
              if (items.length === 0) return null;

              return (
                <section key={section.key} className="myapps-section">
                  <h2 className="myapps-section-title">
                    {section.title}
                    <span className="myapps-section-count">{items.length}</span>
                  </h2>
                  <div className="myapps-list">
                    {items.map((app) => (
                      <ApplicationCard key={app._id} app={app} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
