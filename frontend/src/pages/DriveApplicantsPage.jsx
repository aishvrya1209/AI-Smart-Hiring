import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDrive } from "../api/placementDrives";
import { getJobApplicants, updateApplicationStatus } from "../api/applications";
import "./DriveApplicantsPage.css";

const STATUS_OPTIONS = ["Shortlisted", "Rejected"];

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DriveApplicantsPage() {
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [driveData, applicantsData] = await Promise.all([
          getDrive(id),
          getJobApplicants(id),
        ]);
        setDrive(driveData);
        setApplicants(applicantsData.applications || []);
        setStatus({ loading: false, error: "" });
      } catch (err) {
        setStatus({ loading: false, error: err.message });
      }
    })();
  }, [id]);

  async function handleStatusChange(applicationId, newStatus) {
    setUpdatingId(applicationId);
    try {
      const updated = await updateApplicationStatus(applicationId, newStatus);
      setApplicants((prev) =>
        prev.map((a) => (a._id === applicationId ? { ...a, status: updated.application.status } : a))
      );
    } catch (err) {
      setStatus((s) => ({ ...s, error: err.message }));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="applicants-shell">
      <header className="applicants-header">
        <Link to="/" className="applicants-mark">
          AI Smart Hiring
        </Link>
        <Link to="/company/drives" className="applicants-back">
          ← My drives
        </Link>
      </header>

      <main className="applicants-body">
        <p className="applicants-eyebrow">Applicants</p>
        <h1 className="applicants-headline">{drive ? drive.title : "Loading…"}</h1>

        {status.error && <p className="applicants-error">{status.error}</p>}

        {status.loading ? (
          <p className="applicants-loading">Loading…</p>
        ) : applicants.length === 0 ? (
          <div className="applicants-empty">
            <p>No one has applied to this drive yet.</p>
          </div>
        ) : (
          <div className="applicants-list">
            {applicants.map((app) => {
              const candidate = app.candidateId;
              const user = candidate?.userId;
              return (
                <div key={app._id} className="applicants-card">
                  <div className="applicants-card-top">
                    <div>
                      <h2 className="applicants-card-name">
                        {user?.name || "Unnamed candidate"}
                      </h2>
                      <p className="applicants-card-email">{user?.email}</p>
                    </div>
                    <span className={`applicants-status applicants-status--${app.status}`}>
                      {app.status}
                    </span>
                  </div>

                  {candidate && (
                    <div className="applicants-card-details">
                      {candidate.education?.college && (
                        <p>
                          {candidate.education.degree} · {candidate.education.college}
                          {candidate.education.graduationYear
                            ? ` · ${candidate.education.graduationYear}`
                            : ""}
                        </p>
                      )}
                      {candidate.skills?.length > 0 && (
                        <p className="applicants-card-skills">
                          {candidate.skills.join(", ")}
                        </p>
                      )}
                      <div className="applicants-card-links">
                        {candidate.resume && (
                          <a href={candidate.resume} target="_blank" rel="noreferrer">
                            Resume
                          </a>
                        )}
                        {candidate.github && (
                          <a href={candidate.github} target="_blank" rel="noreferrer">
                            GitHub
                          </a>
                        )}
                        {candidate.linkedin && (
                          <a href={candidate.linkedin} target="_blank" rel="noreferrer">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="applicants-card-footer">
                    <span className="applicants-applied-on">
                      Applied {formatDate(app.appliedAt || app.createdAt)}
                    </span>
                    <div className="applicants-action-buttons">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`applicants-action-btn applicants-action-btn--${opt} ${
                            app.status === opt ? "applicants-action-btn--active" : ""
                          }`}
                          disabled={updatingId === app._id}
                          onClick={() => handleStatusChange(app._id, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
