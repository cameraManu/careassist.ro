import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { fetchCurrentUser, fetchMeta, fetchVitals } from "../../../services/dashboard.service";
import "./PatientDashboard.css";
function computeLatestVitals(records) {
    const latest = records[0];
    return {
        heartRate: latest?.heart_rate ?? null,
        temperature: latest?.ambient_temperature ?? null,
        gasDetected: latest?.gas_detected ?? null
    };
}
export function PatientDashboard() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [userName, setUserName] = React.useState("");
    const [meta, setMeta] = React.useState(null);
    const [vitals, setVitals] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    React.useEffect(() => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        void (async () => {
            setIsLoading(true);
            setError("");
            try {
                const me = await fetchCurrentUser(token);
                setUserName(`${me.user.firstname} ${me.user.lastname}`);
                if (!me.user.device_id) {
                    throw new Error("No device_id found for current user");
                }
                const [vitalsResponse, metaResponse] = await Promise.all([
                    fetchVitals(token, me.user.device_id),
                    fetchMeta(token, me.user.id)
                ]);
                setVitals(vitalsResponse.records);
                setMeta(metaResponse);
            }
            catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : "Failed to load dashboard data");
            }
            finally {
                setIsLoading(false);
            }
        })();
    }, [token]);
    const latestVitals = React.useMemo(() => computeLatestVitals(vitals), [vitals]);
    const handleLogout = React.useCallback(() => {
        logout();
        navigate("/login", { replace: true });
    }, [logout, navigate]);
    if (isLoading) {
        return _jsx("div", { className: "patient-dashboard-state", children: "Loading dashboard..." });
    }
    if (error) {
        return _jsx("div", { className: "patient-dashboard-state patient-dashboard-error", children: error });
    }
    return (_jsxs("div", { className: "patient-dashboard-page", children: [_jsxs("header", { className: "patient-dashboard-header", children: [_jsxs("div", { children: [_jsx("h1", { children: "CareAssist Dashboard" }), _jsx("p", { children: userName })] }), _jsx("button", { type: "button", className: "patient-logout-btn", onClick: handleLogout, children: "Logout" })] }), _jsxs("section", { className: "patient-meta", children: [_jsx("h2", { children: "Patient Info" }), _jsxs("p", { children: ["Age: ", meta?.age ?? "-"] }), _jsxs("p", { children: ["Diagnosis: ", meta?.diagnosis ?? "-"] })] }), _jsxs("section", { className: "patient-cards-grid", children: [_jsxs("article", { className: "patient-metric-card", children: [_jsx("h3", { children: "Heart Rate" }), _jsxs("strong", { children: [latestVitals.heartRate ?? "-", " BPM"] })] }), _jsxs("article", { className: "patient-metric-card", children: [_jsx("h3", { children: "Gas Level" }), _jsx("strong", { children: latestVitals.gasDetected ?? "-" })] }), _jsxs("article", { className: "patient-metric-card", children: [_jsx("h3", { children: "Temperature" }), _jsxs("strong", { children: [latestVitals.temperature ?? "-", " C"] })] })] }), _jsxs("section", { className: "patient-vitals-list", children: [_jsx("h2", { children: "Latest 10 Readings" }), _jsx("ul", { children: vitals.map((record) => (_jsxs("li", { children: [_jsx("span", { children: new Date(record.timestamp).toLocaleString("ro-RO") }), _jsxs("span", { children: ["HR: ", record.heart_rate ?? "-"] }), _jsxs("span", { children: ["Temp: ", record.ambient_temperature ?? "-"] }), _jsxs("span", { children: ["Gas: ", record.gas_detected ?? "-"] })] }, record.id))) })] })] }));
}
