import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <span className="landing-mark">AI Smart Hiring</span>
      </header>

      <div className="landing-choice">
        <button
          type="button"
          className="landing-panel landing-panel--student"
          onClick={() => navigate("/auth/student")}
        >
          <span className="landing-panel-eyebrow">Candidates</span>
          <h2 className="landing-panel-headline">I'm looking for work</h2>
          <p className="landing-panel-note">
            Build a profile once. Let your skills do the talking.
          </p>
          <span className="landing-panel-cta">Get started →</span>
        </button>

        <button
          type="button"
          className="landing-panel landing-panel--company"
          onClick={() => navigate("/auth/company")}
        >
          <span className="landing-panel-eyebrow">Companies</span>
          <h2 className="landing-panel-headline">I'm hiring</h2>
          <p className="landing-panel-note">
            Post a role and find candidates who can prove they can do it.
          </p>
          <span className="landing-panel-cta">Get started →</span>
        </button>
      </div>
    </div>
  );
}
