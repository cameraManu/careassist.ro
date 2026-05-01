import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DoctorDashboard } from "./DoctorDashboard/DoctorDashboard";
import { PatientDashboard } from "./PatientDashboard/PatientDashboard";
import "./Dashboard.css";
export function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = React.useCallback(() => {
        logout();
        navigate("/login", { replace: true });
    }, [logout, navigate]);
    if (!user) {
        return _jsx("div", { className: "dashboard-router-state", children: "Loading dashboard..." });
    }
    if (user.permission_level === 1) {
        return _jsx(PatientDashboard, {});
    }
    if (user.permission_level === 2) {
        return _jsx(DoctorDashboard, {});
    }
    return (_jsxs("div", { className: "dashboard-router-state dashboard-router-error", children: ["Access denied for role level ", user.permission_level, ". Contact an administrator.", _jsx("br", {}), _jsx("button", { type: "button", onClick: handleLogout, children: "Back to Login" })] }));
}
