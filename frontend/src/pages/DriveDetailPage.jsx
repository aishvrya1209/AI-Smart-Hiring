import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDrive } from "../api/placementDrives";
import "./DriveDetailPage.css";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DriveDetailPage() {
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    (async () => {
      try {
        const data = await getDrive(id);
        setDrive(data);
        setStatus({ loading: false, error: "" });
      } catch (err) {
        setStatus({ loading: false, error: err.message });
      }
    })();
  }, [id]);

  return (
    <div className="drivedetail-shell">
      <header className="drivedetail-header">
        <Link to="/" className="drivedetail-mark">
          AI Smart Hiring
        </Link>
        <Link to="/drives" className="drivedetail-back">
          ← All drives
        </Link>
      </header>

      <main className="drivedetail-body">
        {status.loading && <p className="drivedetail-loading">Loading…</p>}
        {status.error && <p className="drivedetail-error">{status.error}</p>}

        {drive && (
          <div className="drivedetail-card">
            <div className="drivedetail-top">
              <span className={`drivedetail-status drivedetail-status--${drive.status}`}>
                {drive.status}
              </span>
              <span className="drivedetail-type">{drive.empType}</span>
            </div>

            <h1 className="drivedetail-title">{drive.title}</h1>
            <p className="drivedetail-meta">
              {drive.jobRole} · {drive.location} · {drive.salary}
            </p>

            <p className="drivedetail-desc">{drive.desc}</p>

            <div className="drivedetail-section">
              <h2>Eligibility</h2>
              <p>{drive.eligibility}</p>
            </div>

            <div className="drivedetail-dates">
              <div>
                <span>Applications open</span>
                <strong>{formatDate(drive.appStart)}</strong>
              </div>
              <div>
                <span>Applications close</span>
                <strong>{formatDate(drive.appEnd)}</strong>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
