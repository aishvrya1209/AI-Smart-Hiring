import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  getCompanyProfile,
  createCompanyProfile,
  updateCompanyProfile,
} from "../api/companyProfile";
import "./CompanyProfilePage.css";

const emptyForm = {
  companyName: "",
  website: "",
  linkedIn: "",
  areaOfWork: "",
  founder: "",
  foundingYear: "",
  description: "",
};

const STATUS_LABEL = {
  pending: "Pending review",
  approved: "Verified",
  rejected: "Changes needed",
};

export default function CompanyProfilePage() {
  const hasToken = !!localStorage.getItem("token");

  const [company, setCompany] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("view"); // "view" | "edit" | "setup"
  const [status, setStatus] = useState({ loading: true, saving: false, error: "" });

  useEffect(() => {
    if (!hasToken) return;

    (async () => {
      try {
        const data = await getCompanyProfile();
        setCompany(data.company);
        setForm(fieldsFrom(data.company));
        setMode(data.company.profileCompleted ? "view" : "setup");
        setStatus({ loading: false, saving: false, error: "" });
      } catch (err) {
        setStatus({ loading: false, saving: false, error: err.message });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasToken) return <Navigate to="/" replace />;

  function fieldsFrom(c) {
    return {
      companyName: c.companyName || "",
      website: c.website || "",
      linkedIn: c.linkedIn || "",
      areaOfWork: c.areaOfWork || "",
      founder: c.founder || "",
      foundingYear: c.foundingYear || "",
      description: c.description || "",
    };
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus((s) => ({ ...s, saving: true, error: "" }));

    const payload = {
      ...form,
      foundingYear: form.foundingYear ? Number(form.foundingYear) : undefined,
    };

    try {
      const data =
        mode === "setup"
          ? await createCompanyProfile(payload)
          : await updateCompanyProfile(payload);

      setCompany((prev) => ({ ...prev, ...data.company, profileCompleted: true }));
      setMode("view");
      setStatus({ loading: false, saving: false, error: "" });
    } catch (err) {
      setStatus((s) => ({ ...s, saving: false, error: err.message }));
    }
  }

  if (status.loading) {
    return (
      <div className="cprofile-shell">
        <TopBar />
        <p className="cprofile-loading">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="cprofile-shell">
      <TopBar />

      <main className="cprofile-body">
        {status.error && <p className="cprofile-error">{status.error}</p>}

        {mode === "view" && company && (
          <ViewMode company={company} onEdit={() => setMode("edit")} />
        )}

        {(mode === "edit" || mode === "setup") && (
          <form className="cprofile-form cprofile-card" onSubmit={handleSubmit}>
            <p className="cprofile-eyebrow">
              {mode === "setup" ? "Complete your profile" : "Edit profile"}
            </p>
            <h1 className="cprofile-headline">
              {mode === "setup"
                ? "Tell candidates who you are."
                : "Update your company details."}
            </h1>

            <Field
              label="Company name"
              value={form.companyName}
              onChange={(v) => updateField("companyName", v)}
              required
            />
            <Field
              label="Website"
              type="url"
              value={form.website}
              onChange={(v) => updateField("website", v)}
            />
            <Field
              label="LinkedIn"
              type="url"
              value={form.linkedIn}
              onChange={(v) => updateField("linkedIn", v)}
            />
            <Field
              label="Area of work"
              value={form.areaOfWork}
              onChange={(v) => updateField("areaOfWork", v)}
            />
            <Field
              label="Founder"
              value={form.founder}
              onChange={(v) => updateField("founder", v)}
            />
            <Field
              label="Founding year"
              type="number"
              value={form.foundingYear}
              onChange={(v) => updateField("foundingYear", v)}
            />

            <label className="cprofile-field">
              <span>Description</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </label>

            <div className="cprofile-actions">
              {mode === "edit" && (
                <button
                  type="button"
                  className="cprofile-cancel"
                  onClick={() => {
                    setForm(fieldsFrom(company));
                    setMode("view");
                  }}
                >
                  Cancel
                </button>
              )}
              <button className="cprofile-submit" type="submit" disabled={status.saving}>
                {status.saving
                  ? "Saving…"
                  : mode === "setup"
                  ? "Submit for verification"
                  : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <header className="cprofile-header">
      <span className="cprofile-mark">AI Smart Hiring</span>
      <Link to="/dashboard" className="cprofile-back">
        ← Dashboard
      </Link>
    </header>
  );
}

function ViewMode({ company, onEdit }) {
  return (
    <div className="cprofile-view cprofile-card">
      <div className="cprofile-view-top">
        <span className={`cprofile-badge cprofile-badge--${company.verificationStatus}`}>
          {STATUS_LABEL[company.verificationStatus] || company.verificationStatus}
        </span>
        <button type="button" className="cprofile-edit" onClick={onEdit}>
          Edit profile
        </button>
      </div>

      <h1 className="cprofile-headline">{company.companyName}</h1>
      {company.companyId && <p className="cprofile-id">ID: {company.companyId}</p>}

      {company.verificationStatus === "rejected" && company.rejectionReason && (
        <p className="cprofile-rejection">
          Reviewer note: {company.rejectionReason}
        </p>
      )}

      <dl className="cprofile-details">
        <Detail label="Email" value={company.email} />
        <Detail label="Website" value={company.website} link />
        <Detail label="LinkedIn" value={company.linkedIn} link />
        <Detail label="Area of work" value={company.areaOfWork} />
        <Detail label="Founder" value={company.founder} />
        <Detail label="Founding year" value={company.foundingYear} />
      </dl>

      {company.description && (
        <p className="cprofile-description">{company.description}</p>
      )}
    </div>
  );
}

function Detail({ label, value, link }) {
  if (!value) return null;
  return (
    <div className="cprofile-detail">
      <dt>{label}</dt>
      <dd>
        {link ? (
          <a href={value} target="_blank" rel="noreferrer">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required }) {
  return (
    <label className="cprofile-field">
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
