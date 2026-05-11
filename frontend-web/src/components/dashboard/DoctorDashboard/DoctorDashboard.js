import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "../../../context/AuthContext";
import { acknowledgeDoctorAlert, fetchDoctorAlerts } from "../../../services/alert.service";
import "./DoctorDashboard.css";
export function DoctorDashboard() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4001";
    const [patients, setPatients] = React.useState([]);
    const [selectedPatientId, setSelectedPatientId] = React.useState(null);
    const [selectedDeviceId, setSelectedDeviceId] = React.useState(null);
    const [vitals, setVitals] = React.useState([]);
    const [alerts, setAlerts] = useState([]);
    const [filters, setFilters] = useState({ severity: "", status: "", range: "" });
    const [isLoadingPatients, setIsLoadingPatients] = React.useState(true);
    const [isLoadingVitals, setIsLoadingVitals] = React.useState(false);
    const [loadingAlerts, setLoadingAlerts] = useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [error, setError] = useState(null);
    const handleLogout = React.useCallback(() => {
        logout();
        navigate("/login", { replace: true });
    }, [logout, navigate]);
    React.useEffect(() => {
        if (!token) {
            setIsLoadingPatients(false);
            return;
        }
        void (async () => {
            setIsLoadingPatients(true);
            setErrorMessage("");
            try {
                const response = await axios.get(`${apiBaseUrl}/api/v1/doctor/patients`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const fetchedPatients = response.data.patients;
                setPatients(fetchedPatients);
                const defaultPatient = fetchedPatients.find((patient) => patient.device_id !== null) ?? fetchedPatients[0];
                if (defaultPatient) {
                    setSelectedPatientId(defaultPatient.id);
                    setSelectedDeviceId(defaultPatient.device_id);
                }
                else {
                    setSelectedPatientId(null);
                    setSelectedDeviceId(null);
                }
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    setErrorMessage(error.response?.data?.message ?? "Nu am putut incarca lista de pacienti.");
                }
                else {
                    setErrorMessage("Nu am putut incarca lista de pacienti.");
                }
            }
            finally {
                setIsLoadingPatients(false);
            }
        })();
    }, [apiBaseUrl, token]);
    React.useEffect(() => {
        if (!token || selectedDeviceId === null) {
            setVitals([]);
            return;
        }
        void (async () => {
            setIsLoadingVitals(true);
            setErrorMessage("");
            try {
                const response = await axios.get(`${apiBaseUrl}/api/v1/vitals/${selectedDeviceId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setVitals(response.data.records);
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    setErrorMessage(error.response?.data?.message ?? "Nu am putut incarca valorile vitale.");
                }
                else {
                    setErrorMessage("Nu am putut incarca valorile vitale.");
                }
            }
            finally {
                setIsLoadingVitals(false);
            }
        })();
    }, [apiBaseUrl, selectedDeviceId, token]);
    useEffect(() => {
        if (!token) {
            setAlerts([]);
            return;
        }
        const fetchAlerts = async () => {
            setLoadingAlerts(true);
            setError(null);
            try {
                const data = await fetchDoctorAlerts(token, filters);
                setAlerts(data.alerts);
            }
            catch (err) {
                setError("Failed to fetch alerts");
            }
            finally {
                setLoadingAlerts(false);
            }
        };
        fetchAlerts();
    }, [filters, token]);
    const handleAcknowledge = async (alertId) => {
        if (!token) {
            return;
        }
        try {
            await acknowledgeDoctorAlert(token, alertId);
            setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status: "acknowledged" } : alert)));
        }
        catch {
            setError("Failed to acknowledge alert");
        }
    };
    const chartVitals = React.useMemo(() => {
        return [...vitals]
            .sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime())
            .map((record) => ({
            ...record,
            chartTimestamp: new Date(record.timestamp).toLocaleTimeString("ro-RO", {
                hour: "2-digit",
                minute: "2-digit"
            })
        }));
    }, [vitals]);
    const latestVitals = React.useMemo(() => chartVitals[chartVitals.length - 1] ?? null, [chartVitals]);
    const selectedPatient = React.useMemo(() => patients.find((patient) => patient.id === selectedPatientId) ?? null, [patients, selectedPatientId]);
    const recentLogs = React.useMemo(() => {
        return chartVitals
            .slice(-4)
            .reverse()
            .map((record) => ({
            id: record.id,
            time: new Date(record.timestamp).toLocaleTimeString("ro-RO", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }),
            text: `HR ${record.heart_rate ?? "-"} BPM | Temp ${record.ambient_temperature ?? "-"} C | Gas ${record.gas_detected ?? "-"}`
        }));
    }, [chartVitals]);
    const handleSelectPatient = React.useCallback((patient) => {
        setSelectedPatientId(patient.id);
        setSelectedDeviceId(patient.device_id);
    }, []);
    function getAlertPatientLabel(alertItem) {
        if (alertItem.patient_firstname && alertItem.patient_lastname) {
            return `${alertItem.patient_firstname} ${alertItem.patient_lastname}`;
        }
        if (alertItem.user_id) {
            return `Patient #${alertItem.user_id}`;
        }
        return "Patient necunoscut";
    }
    return (_jsxs("div", { className: "doctor-dashboard-page", children: [_jsxs("header", { className: "doctor-dashboard-header", children: [_jsxs("div", { children: [_jsx("h1", { children: "Doctor Dashboard" }), _jsxs("p", { children: [user?.firstname, " ", user?.lastname] })] }), _jsx("button", { type: "button", className: "doctor-logout-btn", onClick: handleLogout, children: "Logout" })] }), _jsxs("main", { className: "doctor-dashboard-layout", children: [_jsxs("aside", { className: "doctor-sidebar", children: [_jsx("h2", { children: "Patients" }), isLoadingPatients ? _jsx("p", { children: "Se incarca pacientii..." }) : null, !isLoadingPatients && patients.length === 0 ? _jsx("p", { children: "Nu exista pacienti alocati." }) : null, _jsx("ul", { children: patients.map((patient) => (_jsx("li", { children: _jsxs("button", { type: "button", className: selectedPatientId === patient.id ? "is-active" : "", onClick: () => handleSelectPatient(patient), children: [_jsxs("span", { children: [patient.firstname, " ", patient.lastname] }), _jsx("small", { children: patient.diagnosis ?? "Fara diagnostic inregistrat" })] }) }, patient.id))) })] }), _jsxs("section", { className: "doctor-center", children: [_jsx("h2", { children: "Vitals Overview" }), selectedPatient ? (_jsxs("p", { className: "doctor-selected-patient", children: ["Pacient selectat: ", selectedPatient.firstname, " ", selectedPatient.lastname] })) : (_jsx("p", { className: "doctor-selected-patient", children: "Selecteaza un pacient pentru a vedea valorile." })), _jsxs("div", { className: "doctor-card-grid", children: [_jsxs("article", { className: "doctor-card", children: [_jsxs("div", { className: "doctor-card-title", children: [_jsx("span", { className: "doctor-icon doctor-icon-heart", "aria-hidden": true, children: "\u2764" }), _jsx("h3", { children: "Heart Rate (24h)" })] }), _jsx("span", { className: "doctor-latest-badge doctor-latest-heart", children: isLoadingVitals ? "..." : `${latestVitals?.heart_rate ?? "-"} BPM` }), _jsx("div", { className: "doctor-chart-wrap", children: _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(AreaChart, { data: chartVitals, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "heartGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#ff4d4f", stopOpacity: 0.4 }), _jsx("stop", { offset: "95%", stopColor: "#ff4d4f", stopOpacity: 0 })] }) }), _jsx(XAxis, { dataKey: "chartTimestamp", hide: true }), _jsx(YAxis, { hide: true, domain: ["auto", "auto"] }), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "heart_rate", stroke: "#ff4d4f", fill: "url(#heartGradient)", strokeWidth: 3, dot: false, isAnimationActive: true })] }) }) })] }), _jsxs("article", { className: "doctor-card", children: [_jsxs("div", { className: "doctor-card-title", children: [_jsx("span", { className: "doctor-icon doctor-icon-gas", "aria-hidden": true, children: "G" }), _jsx("h3", { children: "Gas Levels" })] }), _jsx("span", { className: "doctor-latest-badge doctor-latest-gas", children: isLoadingVitals ? "..." : `${latestVitals?.gas_detected ?? "-"}` }), _jsx("div", { className: "doctor-chart-wrap", children: _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(AreaChart, { data: chartVitals, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "gasGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#73d13d", stopOpacity: 0.4 }), _jsx("stop", { offset: "95%", stopColor: "#73d13d", stopOpacity: 0 })] }) }), _jsx(XAxis, { dataKey: "chartTimestamp", hide: true }), _jsx(YAxis, { hide: true, domain: ["auto", "auto"] }), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "gas_detected", stroke: "#73d13d", fill: "url(#gasGradient)", strokeWidth: 3, dot: false, isAnimationActive: true })] }) }) })] }), _jsxs("article", { className: "doctor-card", children: [_jsxs("div", { className: "doctor-card-title", children: [_jsx("span", { className: "doctor-icon doctor-icon-temp", "aria-hidden": true, children: "T" }), _jsx("h3", { children: "Temperature Stability" })] }), _jsxs("div", { className: "doctor-temp-gauge", children: [_jsxs("div", { className: "doctor-temp-ring", children: [_jsx("strong", { children: isLoadingVitals ? "--" : latestVitals?.ambient_temperature ?? "-" }), _jsx("span", { children: "C" })] }), _jsx("p", { children: "Fluctuation: \u00B10.2 C" })] })] }), _jsxs("article", { className: "doctor-card", children: [_jsxs("div", { className: "doctor-card-title", children: [_jsx("span", { className: "doctor-icon doctor-icon-log", "aria-hidden": true, children: "R" }), _jsx("h3", { children: "Recent Logs" })] }), _jsx("ul", { className: "doctor-logs-list", children: recentLogs.map((log) => (_jsxs("li", { children: [_jsx("time", { children: log.time }), _jsx("span", { children: log.text })] }, log.id))) })] })] })] }), _jsxs("aside", { className: "doctor-alerts", children: [_jsx("h2", { children: "Active Alerts" }), _jsxs("div", { className: "doctor-alert-filters", children: [_jsxs("label", { className: "doctor-filter-field", children: [_jsx("span", { children: "Severity" }), _jsxs("select", { value: filters.severity, onChange: (e) => setFilters({ ...filters, severity: e.target.value }), children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "critical", children: "Critical" })] })] }), _jsxs("label", { className: "doctor-filter-field", children: [_jsx("span", { children: "Status" }), _jsxs("select", { value: filters.status, onChange: (e) => setFilters({ ...filters, status: e.target.value }), children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "acknowledged", children: "Acknowledged" })] })] }), _jsxs("label", { className: "doctor-filter-field", children: [_jsx("span", { children: "Time Range" }), _jsxs("select", { value: filters.range, onChange: (e) => setFilters({ ...filters, range: e.target.value }), children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "1h", children: "Last 1 Hour" }), _jsx("option", { value: "24h", children: "Last 24 Hours" }), _jsx("option", { value: "7d", children: "Last 7 Days" })] })] })] }), loadingAlerts && _jsx("p", { children: "Loading alerts..." }), error && _jsx("p", { children: error }), _jsx("ul", { children: alerts.map((alert) => (_jsxs("li", { className: `doctor-alert-item ${alert.status === "acknowledged" ? "doctor-alert-item--acknowledged" : "doctor-alert-item--active"}`, children: [_jsxs("p", { children: [alert.alert_type, " - ", alert.severity, " - ", alert.status] }), _jsx("p", { className: "doctor-alert-patient", children: getAlertPatientLabel(alert) }), _jsx("p", { className: "doctor-alert-time", children: new Date(alert.timestamp).toLocaleString("ro-RO") }), _jsx("button", { onClick: () => handleAcknowledge(alert.id), disabled: alert.status === "acknowledged", className: alert.status === "acknowledged" ? "doctor-alert-btn--resolved" : "", children: alert.status === "acknowledged" ? "Resolved" : "Acknowledge" })] }, alert.id))) }), errorMessage ? _jsx("p", { className: "doctor-error", children: errorMessage }) : null] })] })] }));
}
