import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CompanyProfilePage from "./pages/CompanyProfilePage.jsx";
import CandidateProfilePage from "./pages/CandidateProfilePage.jsx";
import MyDrivesPage from "./pages/MyDrivesPage.jsx";
import DriveFormPage from "./pages/DriveFormPage.jsx";
import BrowseDrivesPage from "./pages/BrowseDrivesPage.jsx";
import DriveDetailPage from "./pages/DriveDetailPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/:role" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/company/profile" element={<CompanyProfilePage />} />
      <Route path="/candidate/profile" element={<CandidateProfilePage />} />
      <Route path="/company/drives" element={<MyDrivesPage />} />
      <Route path="/company/drives/new" element={<DriveFormPage />} />
      <Route path="/company/drives/:id/edit" element={<DriveFormPage />} />
      <Route path="/drives" element={<BrowseDrivesPage />} />
      <Route path="/drives/:id" element={<DriveDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
