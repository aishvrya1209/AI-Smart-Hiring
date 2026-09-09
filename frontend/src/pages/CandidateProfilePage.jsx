import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  getCandidateProfile,
  createCandidateProfile,
  updateCandidateProfile,
} from "../api/candidateProfile";
import "./CandidateProfilePage.css";

const emptyForm = {
  phone: "",
  location: "",
  experience: "Fresher",
  education: { degree: "", college: "", branch: "", graduationYear: "", cgpa: "" },
  skills: [],
  projects: [],
  resume: "",
  github: "",
  linkedin: "",
};

function fieldsFrom(c) {
  return {
    phone: c.phone || "",
    location: c.location || "",
    experience: c.experience || "Fresher",
    education: {
      degree: c.education?.degree || "",
      college: c.education?.college || "",
      branch: c.education?.branch || "",
      graduationYear: c.education?.graduationYear || "",
      cgpa: c.education?.cgpa || "",
    },
    skills: c.skills || [],
    projects: (c.projects || []).map((p) => ({
      name: p.name || "",
      description: p.description || "",
      technologies: (p.technologies || []).join(", "),
      githubLink: p.githubLink || "",
      liveLink: p.liveLink || "",
    })),
    resume: c.resume || "",
    github: c.github || "",
    linkedin: c.linkedin || "",
  };
}

function toPayload(form) {
  return {
    ...form,
    education: {
      ...form.education,
      graduationYear: form.education.graduationYear
        ? Number(form.education.graduationYear)
        : undefined,
      cgpa: form.education.cgpa ? Number(form.education.cgpa) : undefined,
    },
    projects: form.projects.map((p) => ({
      ...p,
      technologies: p.technologies
        ? p.technologies.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    })),
  };
}

export default function CandidateProfilePage() {
  const hasToken = !!localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [candidate, setCandidate] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("setup"); // "view" | "edit" | "setup"
  const [skillInput, setSkillInput] = useState("");
  const [status, setStatus] = useState({ loading: true, saving: false, error: "" });

  useEffect(() => {
    if (!hasToken || role !== "student") return;

    (async () => {
      try {
        const data = await getCandidateProfile();
        setCandidate(data.candidate);
        setForm(fieldsFrom(data.candidate));
        setMode("view");
        setStatus({ loading: false, saving: false, error: "" });
      } catch (err) {
        // 404 just means the profile hasn't been created yet — that's fine.
        if (err.message.toLowerCase().includes("not found")) {
          setMode("setup");
          setStatus({ loading: false, saving: false, error: "" });
        } else {
          setStatus({ loading: false, saving: false, error: err.message });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasToken || role !== "student") return <Navigate to="/" replace />;

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateEducation(key, value) {
    setForm((prev) => ({ ...prev, education: { ...prev.education, [key]: value } }));
  }

  function addSkill() {
    const value = skillInput.trim();
    if (!value || form.skills.includes(value)) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, value] }));
    setSkillInput("");
  }

  function removeSkill(skill) {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  }

  function addProject() {
    setForm((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { name: "", description: "", technologies: "", githubLink: "", liveLink: "" },
      ],
    }));
  }

  function updateProject(index, key, value) {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    }));
  }

  function removeProject(index) {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus((s) => ({ ...s, saving: true, error: "" }));

    try {
      const payload = toPayload(form);
      const data =
        mode === "setup"
          ? await createCandidateProfile(payload)
          : await updateCandidateProfile(payload);

      setCandidate(data.candidate);
      setForm(fieldsFrom(data.candidate));
      setMode("view");
      setStatus({ loading: false, saving: false, error: "" });
    } catch (err) {
      setStatus((s) => ({ ...s, saving: false, error: err.message }));
    }
  }

  return (
    <div className="candprofile-shell">
      <header className="candprofile-header">
        <span className="candprofile-mark">AI Smart Hiring</span>
        <Link to="/dashboard" className="candprofile-back">
          ← Dashboard
        </Link>
      </header>

      <main className="candprofile-body">
        {status.error && <p className="candprofile-error">{status.error}</p>}

        {status.loading ? (
          <p className="candprofile-loading">Loading…</p>
        ) : mode === "view" && candidate ? (
          <ViewMode candidate={candidate} onEdit={() => setMode("edit")} />
        ) : (
          <form className="candprofile-card" onSubmit={handleSubmit}>
            <p className="candprofile-eyebrow">
              {mode === "setup" ? "Complete your profile" : "Edit profile"}
            </p>
            <h1 className="candprofile-headline">
              {mode === "setup"
                ? "Show companies what you can do."
                : "Update your profile."}
            </h1>

            <div className="candprofile-row">
              <Field label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
              <Field
                label="Location"
                value={form.location}
                onChange={(v) => updateField("location", v)}
              />
            </div>

            <label className="candprofile-field">
              <span>Experience</span>
              <select
                value={form.experience}
                onChange={(e) => updateField("experience", e.target.value)}
              >
                <option value="Fresher">Fresher</option>
                <option value="Experienced">Experienced</option>
              </select>
            </label>

            <h3 className="candprofile-subhead">Education</h3>
            <div className="candprofile-row">
              <Field
                label="Degree"
                value={form.education.degree}
                onChange={(v) => updateEducation("degree", v)}
              />
              <Field
                label="College"
                value={form.education.college}
                onChange={(v) => updateEducation("college", v)}
              />
            </div>
            <div className="candprofile-row">
              <Field
                label="Branch"
                value={form.education.branch}
                onChange={(v) => updateEducation("branch", v)}
              />
              <Field
                label="Graduation year"
                type="number"
                value={form.education.graduationYear}
                onChange={(v) => updateEducation("graduationYear", v)}
              />
              <Field
                label="CGPA"
                type="number"
                value={form.education.cgpa}
                onChange={(v) => updateEducation("cgpa", v)}
              />
            </div>

            <h3 className="candprofile-subhead">Skills</h3>
            <div className="candprofile-skill-input">
              <input
                type="text"
                placeholder="e.g. React"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button type="button" onClick={addSkill}>
                Add
              </button>
            </div>
            <div className="candprofile-skills">
              {form.skills.map((skill) => (
                <span key={skill} className="candprofile-chip">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="candprofile-projects-head">
              <h3 className="candprofile-subhead">Projects</h3>
              <button type="button" className="candprofile-add-project" onClick={addProject}>
                + Add project
              </button>
            </div>

            {form.projects.map((project, index) => (
              <div key={index} className="candprofile-project-block">
                <div className="candprofile-row">
                  <Field
                    label="Project name"
                    value={project.name}
                    onChange={(v) => updateProject(index, "name", v)}
                  />
                  <Field
                    label="Technologies (comma separated)"
                    value={project.technologies}
                    onChange={(v) => updateProject(index, "technologies", v)}
                  />
                </div>
                <label className="candprofile-field">
                  <span>Description</span>
                  <textarea
                    rows={2}
                    value={project.description}
                    onChange={(e) => updateProject(index, "description", e.target.value)}
                  />
                </label>
                <div className="candprofile-row">
                  <Field
                    label="GitHub link"
                    value={project.githubLink}
                    onChange={(v) => updateProject(index, "githubLink", v)}
                  />
                  <Field
                    label="Live link"
                    value={project.liveLink}
                    onChange={(v) => updateProject(index, "liveLink", v)}
                  />
                </div>
                <button
                  type="button"
                  className="candprofile-remove-project"
                  onClick={() => removeProject(index)}
                >
                  Remove project
                </button>
              </div>
            ))}

            <h3 className="candprofile-subhead">Links</h3>
            <div className="candprofile-row">
              <Field
                label="Resume URL"
                value={form.resume}
                onChange={(v) => updateField("resume", v)}
              />
              <Field
                label="GitHub"
                value={form.github}
                onChange={(v) => updateField("github", v)}
              />
              <Field
                label="LinkedIn"
                value={form.linkedin}
                onChange={(v) => updateField("linkedin", v)}
              />
            </div>

            <div className="candprofile-actions">
              {mode === "edit" && (
                <button
                  type="button"
                  className="candprofile-cancel"
                  onClick={() => {
                    setForm(fieldsFrom(candidate));
                    setMode("view");
                  }}
                >
                  Cancel
                </button>
              )}
              <button className="candprofile-submit" type="submit" disabled={status.saving}>
                {status.saving ? "Saving…" : mode === "setup" ? "Create profile" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function ViewMode({ candidate, onEdit }) {
  return (
    <div className="candprofile-card">
      <div className="candprofile-view-top">
        <span className="candprofile-badge">{candidate.experience}</span>
        <button type="button" className="candprofile-edit" onClick={onEdit}>
          Edit profile
        </button>
      </div>

      <h1 className="candprofile-headline">{candidate.userId?.name}</h1>
      <p className="candprofile-contact">
        {candidate.userId?.email}
        {candidate.phone ? ` · ${candidate.phone}` : ""}
        {candidate.location ? ` · ${candidate.location}` : ""}
      </p>

      {candidate.education?.degree && (
        <div className="candprofile-section">
          <h2>Education</h2>
          <p>
            {candidate.education.degree}
            {candidate.education.branch ? `, ${candidate.education.branch}` : ""}
            {candidate.education.college ? ` — ${candidate.education.college}` : ""}
          </p>
          <p className="candprofile-muted">
            {candidate.education.graduationYear ? `Class of ${candidate.education.graduationYear}` : ""}
            {candidate.education.cgpa ? ` · CGPA ${candidate.education.cgpa}` : ""}
          </p>
        </div>
      )}

      {candidate.skills?.length > 0 && (
        <div className="candprofile-section">
          <h2>Skills</h2>
          <div className="candprofile-skills">
            {candidate.skills.map((skill) => (
              <span key={skill} className="candprofile-chip candprofile-chip--static">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {candidate.projects?.length > 0 && (
        <div className="candprofile-section">
          <h2>Projects</h2>
          {candidate.projects.map((project, i) => (
            <div key={i} className="candprofile-project-view">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              {project.technologies?.length > 0 && (
                <p className="candprofile-muted">{project.technologies.join(", ")}</p>
              )}
              <p className="candprofile-project-links">
                {project.githubLink && (
                  <a href={project.githubLink} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                )}
                {project.liveLink && (
                  <a href={project.liveLink} target="_blank" rel="noreferrer">
                    Live
                  </a>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {(candidate.resume || candidate.github || candidate.linkedin) && (
        <div className="candprofile-section">
          <h2>Links</h2>
          <p className="candprofile-project-links">
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
          </p>
        </div>
      )}
    </div>
  );
}

function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="candprofile-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
