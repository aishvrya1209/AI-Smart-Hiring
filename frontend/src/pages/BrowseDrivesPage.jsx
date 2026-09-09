import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllDrives } from "../api/placementDrives";
import "./BrowseDrivesPage.css";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BrowseDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllDrives();
        const live = all.filter((d) => d.status === "live");
        setDrives(live);
        setStatus({ loading: false, error: "" });
      } catch (err) {
        setStatus({ loading: false, error: err.message });
      }
    })();
  }, []);

  return (
    <div className="browse-shell">
      <header className="browse-header">
        <Link to="/" className="browse-mark">
          AI Smart Hiring
        </Link>
        <Link to="/dashboard" className="browse-back">
          Dashboard →
        </Link>
      </header>

      <main className="browse-body">
        <p className="browse-eyebrow">Open drives</p>
        <h1 className="browse-headline">Find your next role.</h1>

        {status.error && <p className="browse-error">{status.error}</p>}

        {status.loading ? (
          <p className="browse-loading">Loading…</p>
        ) : drives.length === 0 ? (
          <p className="browse-empty">No open drives right now — check back soon.</p>
        ) : (
          <div className="browse-list">
            {drives.map((drive) => (
              <Link key={drive._id} to={`/drives/${drive._id}`} className="browse-card">
                <div className="browse-card-top">
                  <span className="browse-card-type">{drive.empType}</span>
                  <span className="browse-card-deadline">
                    Apply by {formatDate(drive.appEnd)}
                  </span>
                </div>
                <h2 className="browse-card-title">{drive.title}</h2>
                <p className="browse-card-meta">
                  {drive.jobRole} · {drive.location}
                </p>
                <p className="browse-card-salary">{drive.salary}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
