import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { getAllDrives, deleteDrive } from "../api/placementDrives";
import { getCompanyProfile } from "../api/companyProfile";
import "./MyDrivesPage.css";

export default function MyDrivesPage() {
  const hasToken = !!localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const account = JSON.parse(localStorage.getItem("account") || "null");

  const [drives, setDrives] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [deletingId, setDeletingId] = useState(null);
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    if (!hasToken || role !== "company") return;

    (async () => {
      try {
        const [all, profileData] = await Promise.all([
          getAllDrives(),
          getCompanyProfile(),
        ]);
        const mine = all.filter((d) => String(d.companyId) === String(account?.id));
        setDrives(mine);
        setVerification(profileData.company?.verificationStatus || "pending");
        setStatus({ loading: false, error: "" });
      } catch (err) {
        setStatus({ loading: false, error: err.message });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasToken || role !== "company") return <Navigate to="/" replace />;

  async function handleDelete(id) {
    if (!window.confirm("Delete this drive? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await deleteDrive(id);
      setDrives((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      setStatus((s) => ({ ...s, error: err.message }));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mydrives-shell">
      <header className="mydrives-header">
        <span className="mydrives-mark">AI Smart Hiring</span>
        <Link to="/dashboard" className="mydrives-back">
          ← Dashboard
        </Link>
      </header>

      <main className="mydrives-body">
        <div className="mydrives-top">
          <div>
            <p className="mydrives-eyebrow">Company</p>
            <h1 className="mydrives-headline">Your placement drives</h1>
          </div>
          {verification === "approved" ? (
            <Link to="/company/drives/new" className="mydrives-new">
              + New drive
            </Link>
          ) : (
            <span
              className="mydrives-new mydrives-new--disabled"
              title="Your company must be verified before you can create drives"
            >
              + New drive
            </span>
          )}
        </div>

        {verification && verification !== "approved" && (
          <div className={`mydrives-verify-banner mydrives-verify-banner--${verification}`}>
            {verification === "pending" && (
              <p>
                Your company account is <strong>pending admin verification</strong>. You'll be
                able to create placement drives once an admin approves your profile.
              </p>
            )}
            {verification === "rejected" && (
              <p>
                Your company verification was <strong>rejected</strong>. Update your company
                profile and resubmit to be reviewed again before you can create drives.
              </p>
            )}
          </div>
        )}

        {status.error && <p className="mydrives-error">{status.error}</p>}

        {status.loading ? (
          <p className="mydrives-loading">Loading…</p>
        ) : drives.length === 0 ? (
          <div className="mydrives-empty">
            <p>You haven't created any drives yet.</p>
            <Link to="/company/drives/new" className="mydrives-empty-cta">
              Create your first drive →
            </Link>
          </div>
        ) : (
          <div className="mydrives-list">
            {drives.map((drive) => (
              <div key={drive._id} className="mydrives-card">
                <div className="mydrives-card-top">
                  <span className={`mydrives-status mydrives-status--${drive.status}`}>
                    {drive.status}
                  </span>
                  <span className="mydrives-type">{drive.empType}</span>
                </div>

                <h2 className="mydrives-card-title">{drive.title}</h2>
                <p className="mydrives-card-meta">
                  {drive.jobRole} · {drive.location} · {drive.salary}
                </p>

                <div className="mydrives-card-actions">
                  <Link to={`/drives/${drive._id}`} className="mydrives-view">
                    View
                  </Link>
                  <Link to={`/company/drives/${drive._id}/applicants`} className="mydrives-view">
                    Applicants
                  </Link>
                  <Link to={`/company/drives/${drive._id}/edit`} className="mydrives-edit">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="mydrives-delete"
                    disabled={deletingId === drive._id}
                    onClick={() => handleDelete(drive._id)}
                  >
                    {deletingId === drive._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
