import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getPendingCompanies, approveCompany, rejectCompany } from "../api/admin";
import "./AdminDashboardPage.css";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const hasToken = !!localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const account = JSON.parse(localStorage.getItem("account") || "null");

  const [companies, setCompanies] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [busyId, setBusyId] = useState(null);
  // Company id currently showing an inline "reason" box for rejection.
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!hasToken || role !== "admin") return;
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCompanies() {
    setStatus({ loading: true, error: "" });
    try {
      const list = await getPendingCompanies();
      setCompanies(list);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  if (!hasToken || role !== "admin") return <Navigate to="/admin/login" replace />;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("account");
    navigate("/admin/login");
  }

  async function handleApprove(id) {
    setBusyId(id);
    try {
      await approveCompany(id);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setStatus((s) => ({ ...s, error: err.message }));
    } finally {
      setBusyId(null);
    }
  }

  function openReject(id) {
    setRejectingId(id);
    setReason("");
  }

  function cancelReject() {
    setRejectingId(null);
    setReason("");
  }

  async function confirmReject(id) {
    if (!reason.trim()) {
      setStatus((s) => ({ ...s, error: "A rejection reason is required." }));
      return;
    }
    setBusyId(id);
    try {
      await rejectCompany(id, reason.trim());
      setCompanies((prev) => prev.filter((c) => c._id !== id));
      setRejectingId(null);
      setReason("");
    } catch (err) {
      setStatus((s) => ({ ...s, error: err.message }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admindash-shell">
      <header className="admindash-header">
        <span className="admindash-mark">AI Smart Hiring — Admin</span>
        <div className="admindash-header-right">
          {account?.name && <span className="admindash-name">{account.name}</span>}
          <button type="button" className="admindash-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="admindash-body">
        <div className="admindash-top">
          <div>
            <p className="admindash-eyebrow">Verification queue</p>
            <h1 className="admindash-headline">Pending companies</h1>
          </div>
          <button type="button" className="admindash-refresh" onClick={loadCompanies}>
            Refresh
          </button>
        </div>

        {status.error && <p className="admindash-error">{status.error}</p>}

        {status.loading ? (
          <p className="admindash-loading">Loading…</p>
        ) : companies.length === 0 ? (
          <div className="admindash-empty">
            <p>No companies waiting on review right now.</p>
          </div>
        ) : (
          <div className="admindash-list">
            {companies.map((company) => (
              <div key={company._id} className="admindash-card">
                <div className="admindash-card-top">
                  <h2 className="admindash-card-title">{company.companyName}</h2>
                  <span className="admindash-status">{company.verificationStatus}</span>
                </div>

                <p className="admindash-card-meta">
                  {company.email}
                  {company.phone ? ` · ${company.phone}` : ""}
                </p>

                {company.areaOfWork && (
                  <p className="admindash-card-line">
                    <strong>Area of work:</strong> {company.areaOfWork}
                  </p>
                )}
                {company.founder && (
                  <p className="admindash-card-line">
                    <strong>Founder:</strong> {company.founder}
                    {company.foundingYear ? ` · founded ${company.foundingYear}` : ""}
                  </p>
                )}
                {company.website && (
                  <p className="admindash-card-line">
                    <strong>Website:</strong>{" "}
                    <a href={company.website} target="_blank" rel="noreferrer">
                      {company.website}
                    </a>
                  </p>
                )}
                {company.linkedIn && (
                  <p className="admindash-card-line">
                    <strong>LinkedIn:</strong>{" "}
                    <a href={company.linkedIn} target="_blank" rel="noreferrer">
                      {company.linkedIn}
                    </a>
                  </p>
                )}
                {company.description && (
                  <p className="admindash-card-desc">{company.description}</p>
                )}

                {rejectingId === company._id ? (
                  <div className="admindash-reject-box">
                    <textarea
                      className="admindash-reject-input"
                      placeholder="Reason for rejection…"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                    />
                    <div className="admindash-card-actions">
                      <button
                        type="button"
                        className="admindash-cancel"
                        onClick={cancelReject}
                        disabled={busyId === company._id}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="admindash-reject-confirm"
                        onClick={() => confirmReject(company._id)}
                        disabled={busyId === company._id}
                      >
                        {busyId === company._id ? "Submitting…" : "Confirm reject"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="admindash-card-actions">
                    <button
                      type="button"
                      className="admindash-approve"
                      onClick={() => handleApprove(company._id)}
                      disabled={busyId === company._id}
                    >
                      {busyId === company._id ? "Approving…" : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="admindash-reject"
                      onClick={() => openReject(company._id)}
                      disabled={busyId === company._id}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
