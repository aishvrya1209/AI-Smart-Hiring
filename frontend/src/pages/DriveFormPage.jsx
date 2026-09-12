import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import { getDrive, createDrive, updateDrive } from "../api/placementDrives";
import { getCompanyProfile } from "../api/companyProfile";
import "./DriveFormPage.css";

const emptyForm = {
  title: "",
  desc: "",
  jobRole: "",
  location: "",
  empType: "Full-Time",
  salary: "",
  eligibility: "",
  appStart: "",
  appEnd: "",
  status: "draft",
};

// Mongo dates come back as full ISO strings; <input type="date"> needs YYYY-MM-DD.
function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function DriveFormPage() {
  const { id } = useParams(); // undefined on the "create" route
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const hasToken = !!localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({
    loading: isEdit,
    saving: false,
    error: "",
  });
  const [verification, setVerification] = useState(isEdit ? "approved" : null);

  useEffect(() => {
    if (isEdit) return;

    (async () => {
      try {
        const profileData = await getCompanyProfile();
        setVerification(profileData.company?.verificationStatus || "pending");
      } catch {
        setVerification("pending");
      }
    })();
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        const drive = await getDrive(id);
        setForm({
          title: drive.title || "",
          desc: drive.desc || "",
          jobRole: drive.jobRole || "",
          location: drive.location || "",
          empType: drive.empType || "Full-Time",
          salary: drive.salary || "",
          eligibility: drive.eligibility || "",
          appStart: toDateInput(drive.appStart),
          appEnd: toDateInput(drive.appEnd),
          status: drive.status || "draft",
        });
        setStatus({ loading: false, saving: false, error: "" });
      } catch (err) {
        setStatus({ loading: false, saving: false, error: err.message });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!hasToken || role !== "company") return <Navigate to="/" replace />;

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus((s) => ({ ...s, saving: true, error: "" }));

    try {
      if (isEdit) {
        await updateDrive(id, form);
      } else {
        await createDrive(form);
      }
      navigate("/company/drives");
    } catch (err) {
      setStatus((s) => ({ ...s, saving: false, error: err.message }));
    }
  }

  return (
    <div className="driveform-shell">
      <header className="driveform-header">
        <span className="driveform-mark">AI Smart Hiring</span>
        <Link to="/company/drives" className="driveform-back">
          ← My drives
        </Link>
      </header>

      <main className="driveform-body">
        {status.loading || verification === null ? (
          <p className="driveform-loading">Loading…</p>
        ) : verification !== "approved" ? (
          <div className="driveform-card">
            <p className="driveform-eyebrow">New placement drive</p>
            <h1 className="driveform-headline">Verification required</h1>
            <p className="driveform-blocked-note">
              {verification === "pending"
                ? "Your company account is pending admin verification. You'll be able to create placement drives once an admin approves your profile."
                : "Your company verification was rejected. Update your company profile and resubmit before you can create drives."}
            </p>
            <div className="driveform-actions">
              <Link to="/company/drives" className="driveform-cancel">
                ← Back to my drives
              </Link>
              <Link to="/company/profile" className="driveform-submit">
                Go to company profile
              </Link>
            </div>
          </div>
        ) : (
          <form className="driveform-card" onSubmit={handleSubmit}>
            <p className="driveform-eyebrow">
              {isEdit ? "Edit drive" : "New placement drive"}
            </p>
            <h1 className="driveform-headline">
              {isEdit ? "Update this drive" : "Create a placement drive"}
            </h1>

            {status.error && <p className="driveform-error">{status.error}</p>}

            <Field
              label="Title"
              value={form.title}
              onChange={(v) => updateField("title", v)}
              required
            />

            <label className="driveform-field">
              <span>Description</span>
              <textarea
                rows={4}
                value={form.desc}
                onChange={(e) => updateField("desc", e.target.value)}
                required
              />
            </label>

            <div className="driveform-row">
              <Field
                label="Job role"
                value={form.jobRole}
                onChange={(v) => updateField("jobRole", v)}
                required
              />
              <Field
                label="Location"
                value={form.location}
                onChange={(v) => updateField("location", v)}
                required
              />
            </div>

            <div className="driveform-row">
              <label className="driveform-field">
                <span>Employment type</span>
                <select
                  value={form.empType}
                  onChange={(e) => updateField("empType", e.target.value)}
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                </select>
              </label>

              <Field
                label="Salary"
                value={form.salary}
                onChange={(v) => updateField("salary", v)}
                required
              />
            </div>

            <label className="driveform-field">
              <span>Eligibility</span>
              <textarea
                rows={2}
                value={form.eligibility}
                onChange={(e) => updateField("eligibility", e.target.value)}
                required
              />
            </label>

            <div className="driveform-row">
              <Field
                label="Applications open"
                type="date"
                value={form.appStart}
                onChange={(v) => updateField("appStart", v)}
                required
              />
              <Field
                label="Applications close"
                type="date"
                value={form.appEnd}
                onChange={(v) => updateField("appEnd", v)}
                required
              />
            </div>

            <label className="driveform-field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="live">Live</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            <div className="driveform-actions">
              <Link to="/company/drives" className="driveform-cancel">
                Cancel
              </Link>
              <button className="driveform-submit" type="submit" disabled={status.saving}>
                {status.saving ? "Saving…" : isEdit ? "Save changes" : "Create drive"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required }) {
  return (
    <label className="driveform-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
