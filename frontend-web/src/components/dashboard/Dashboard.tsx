import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DoctorDashboard } from "./DoctorDashboard/DoctorDashboard";
import { PatientDashboard } from "./PatientDashboard/PatientDashboard";
import "./Dashboard.css";

export function Dashboard(): React.JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = React.useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  if (!user) {
    return <div className="dashboard-router-state">Loading dashboard...</div>;
  }

  if (user.permission_level === 1) {
    return <PatientDashboard />;
  }

  if (user.permission_level === 2) {
    return <DoctorDashboard />;
  }

  return (
    <div className="dashboard-router-state dashboard-router-error">
      Access denied for role level {user.permission_level}. Contact an administrator.
      <br />
      <button type="button" onClick={handleLogout}>
        Back to Login
      </button>
    </div>
  );
}
