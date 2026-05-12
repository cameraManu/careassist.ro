import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./Dashboard.css";
import { useState, useEffect } from "react";
import { getApiV1BaseUrl } from "./config/apiBaseUrl.js";
const patients = [
    {
        user: { id: 100, firstname: "Robert", lastname: "Chen" },
        status: "Stable",
    },
    {
        user: { id: 101, firstname: "Elena", lastname: "Rodriguez" },
        status: "Alert",
        alertText: "Alert: Tachycardia",
    },
    {
        user: { id: 102, firstname: "Marcus", lastname: "Thorne" },
        status: "Observation",
    },
];
const activityLogs = [
    { id: "a1", text: "Routine vitals check performed", timestamp: "14:30:12" },
    { id: "a2", text: "Dosage adjustment: Atenolol 25mg", timestamp: "11:15:00" },
    { id: "a3", text: "Patient sleep cycle detected", timestamp: "23:45:05" },
];
const alerts = [
    {
        lid: 1,
        device_id: 1,
        user_id: 101,
        timestamp: "2026-04-30T14:42:00",
        alert_type: "CRITICAL_HEART_RATE",
        severity: "critical",
    },
    {
        lid: 2,
        device_id: 1,
        user_id: 103,
        timestamp: "2026-04-30T14:40:12",
        alert_type: "FALL_DETECTED",
        severity: "high",
    },
];
function severityLabel(severity) {
    if (severity === "critical")
        return "Critical";
    if (severity === "high")
        return "High";
    if (severity === "medium")
        return "Medium";
    return "Low";
}
// Mock function to determine patient status - can be replaced with actual data
function getPatientStatus(userId) {
    const statuses = [
        "Stable",
        "Observation",
        "Alert",
    ];
    return statuses[userId % 3];
}
export function Dashboard() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const apiUrl = getApiV1BaseUrl();
                const response = await fetch(`${apiUrl}/patients`);
                const data = await response.json();
                const patientSummaries = data.map((user) => ({
                    user,
                    status: getPatientStatus(user.id),
                    alertText: undefined,
                }));
                setPatients(patientSummaries);
                if (patientSummaries.length > 0) {
                    setSelectedPatient(patientSummaries[0]);
                }
            }
            catch (error) {
                console.error("Failed to fetch patients:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);
    const latestVitals = {
        heart_rate: 72,
        ambient_temperature: 36.6,
        gas_detected: 98,
    };
    function handleSelectPatient(patient) {
        setSelectedPatient(patient);
    }
    const filteredPatients = patients.filter((patient) => {
        const fullName = `${patient.user.firstname} ${patient.user.lastname}`.toLowerCase();
        return fullName.includes(searchText.toLowerCase());
    });
    return (_jsxs("div", { className: "dashboard-page", children: [_jsxs("header", { className: "dashboard-header", children: [_jsxs("div", { className: "brand-wrap", children: [_jsx("div", { className: "brand-icon", children: "+" }), _jsx("h1", { children: "CareAssist" })] }), _jsxs("nav", { className: "header-actions", children: [_jsx("a", { href: "#thresholds", children: "Set Thresholds" }), _jsx("a", { className: "primary", href: "#prescriptions", children: "+ Add Prescription" }), _jsx("div", { className: "profile-dot" })] })] }), _jsxs("main", { className: "dashboard-layout", children: [_jsxs("aside", { className: "left-sidebar", children: [_jsxs("div", { className: "sidebar-title-row", children: [_jsx("h2", { children: "Patient Directory" }), _jsx("input", { type: "text", placeholder: "Search patients...", value: searchText, onChange: (e) => setSearchText(e.target.value) })] }), _jsx("ul", { className: "patient-list", children: filteredPatients.map((patient) => (_jsx("li", { children: _jsxs("button", { className: `patient-btn ${patient === selectedPatient ? "active" : ""} ${patient.status.toLowerCase()}`, onClick: () => handleSelectPatient(patient), children: [_jsxs("span", { className: "patient-name", children: [patient.user.firstname, " ", patient.user.lastname] }), _jsx("span", { className: `patient-status ${patient.status.toLowerCase()}`, children: patient.alertText ?? patient.status })] }) }, patient.user.id))) })] }), _jsxs("section", { className: "center-panel", children: [_jsxs("div", { className: "panel-head", children: [_jsxs("div", { children: [_jsxs("h2", { children: [selectedPatient?.user.firstname, " ", selectedPatient?.user.lastname] }), _jsxs("p", { children: ["ID: #", selectedPatient?.user.id, " | Ward 4, Room 12"] })] }), _jsx("span", { className: "status-pill", children: selectedPatient?.status })] }), _jsxs("div", { className: "cards-grid", children: [_jsxs("article", { className: "card", children: [_jsxs("div", { className: "card-head", children: [_jsx("h3", { children: "Heart Rate History (24h)" }), _jsxs("strong", { children: [latestVitals.heart_rate, " BPM"] })] }), _jsx("div", { className: "chart-placeholder red", children: "Chart placeholder" })] }), _jsxs("article", { className: "card", children: [_jsxs("div", { className: "card-head", children: [_jsx("h3", { children: "Room Gas Levels" }), _jsxs("strong", { children: [latestVitals.gas_detected, "% O2"] })] }), _jsx("div", { className: "chart-placeholder blue", children: "Chart placeholder" })] })] }), _jsxs("div", { className: "bottom-grid", children: [_jsxs("article", { className: "card compact", children: [_jsx("h3", { children: "Temperature Stability" }), _jsxs("div", { className: "temperature-circle", children: [latestVitals.ambient_temperature, " C"] }), _jsx("p", { children: "Fluctuation: +-0.2 C" })] }), _jsxs("article", { className: "card logs", children: [_jsx("h3", { children: "Recent Activity Logs" }), _jsx("ul", { children: activityLogs.map((item) => (_jsxs("li", { children: [_jsx("span", { children: item.text }), _jsx("time", { children: item.timestamp })] }, item.id))) })] })] })] }), _jsxs("aside", { className: "right-sidebar", children: [_jsx("h2", { children: "Active Emergency Alerts" }), _jsx("div", { className: "alerts-wrap", children: alerts.map((alert) => (_jsxs("article", { className: "alert-card", children: [_jsxs("p", { className: "alert-severity", children: [severityLabel(alert.severity), ": ", alert.alert_type] }), _jsxs("p", { className: "alert-meta", children: ["User #", alert.user_id ?? "-", " | Device #", alert.device_id ?? "-"] }), _jsx("p", { className: "alert-time", children: new Date(alert.timestamp).toLocaleTimeString("ro-RO") }), _jsx("button", { type: "button", children: "Acknowledge" })] }, alert.lid))) }), _jsx("div", { className: "server-status", children: "Server Status: Online | Low Latency" })] })] })] }));
}
