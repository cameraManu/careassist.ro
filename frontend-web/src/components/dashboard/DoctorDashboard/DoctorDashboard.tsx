import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useAuth } from "../../../context/AuthContext";
import {
  acknowledgeDoctorAlert,
  fetchDoctorAlerts,
  type DoctorAlert
} from "../../../services/alert.service";
import "./DoctorDashboard.css";

type DoctorPatientSummary = {
  id: number;
  firstname: string;
  lastname: string;
  diagnosis: string | null;
  device_id: number | null;
};

type DoctorPatientsResponse = {
  patients: DoctorPatientSummary[];
};

type VitalsRecord = {
  id: number;
  timestamp: string;
  heart_rate: number | null;
  ambient_temperature: number | null;
  gas_detected: number | null;
};

type VitalsResponse = {
  records: VitalsRecord[];
};

type ChartVitalsPoint = VitalsRecord & {
  chartTimestamp: string;
};

export function DoctorDashboard(): React.JSX.Element {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4001";
  const [patients, setPatients] = React.useState<DoctorPatientSummary[]>([]);
  const [selectedPatientId, setSelectedPatientId] = React.useState<number | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<number | null>(null);
  const [vitals, setVitals] = React.useState<VitalsRecord[]>([]);
  const [alerts, setAlerts] = useState<DoctorAlert[]>([]);
  const [filters, setFilters] = useState({ severity: "", status: "", range: "" });
  const [isLoadingPatients, setIsLoadingPatients] = React.useState<boolean>(true);
  const [isLoadingVitals, setIsLoadingVitals] = React.useState<boolean>(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [error, setError] = useState<string | null>(null);

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
        const response = await axios.get<DoctorPatientsResponse>(`${apiBaseUrl}/api/v1/doctor/patients`, {
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
        } else {
          setSelectedPatientId(null);
          setSelectedDeviceId(null);
        }
      } catch (error) {
        if (axios.isAxiosError<{ message?: string }>(error)) {
          setErrorMessage(error.response?.data?.message ?? "Nu am putut incarca lista de pacienti.");
        } else {
          setErrorMessage("Nu am putut incarca lista de pacienti.");
        }
      } finally {
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
        const response = await axios.get<VitalsResponse>(`${apiBaseUrl}/api/v1/vitals/${selectedDeviceId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setVitals(response.data.records);
      } catch (error) {
        if (axios.isAxiosError<{ message?: string }>(error)) {
          setErrorMessage(error.response?.data?.message ?? "Nu am putut incarca valorile vitale.");
        } else {
          setErrorMessage("Nu am putut incarca valorile vitale.");
        }
      } finally {
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
      } catch (err) {
        setError("Failed to fetch alerts");
      } finally {
        setLoadingAlerts(false);
      }
    };

    fetchAlerts();
  }, [filters, token]);

  const handleAcknowledge = async (alertId: number) => {
    if (!token) {
      return;
    }

    try {
      await acknowledgeDoctorAlert(token, alertId);
      setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status: "acknowledged" } : alert)));
    } catch {
      setError("Failed to acknowledge alert");
    }
  };

  const chartVitals = React.useMemo<ChartVitalsPoint[]>(() => {
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

  const selectedPatient = React.useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

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

  const handleSelectPatient = React.useCallback((patient: DoctorPatientSummary) => {
    setSelectedPatientId(patient.id);
    setSelectedDeviceId(patient.device_id);
  }, []);

  function getAlertPatientLabel(alertItem: DoctorAlert): string {
    if (alertItem.patient_firstname && alertItem.patient_lastname) {
      return `${alertItem.patient_firstname} ${alertItem.patient_lastname}`;
    }
    if (alertItem.user_id) {
      return `Patient #${alertItem.user_id}`;
    }
    return "Patient necunoscut";
  }

  return (
    <div className="doctor-dashboard-page">
      <header className="doctor-dashboard-header">
        <div>
          <h1>Doctor Dashboard</h1>
          <p>
            {user?.firstname} {user?.lastname}
          </p>
        </div>
        <button type="button" className="doctor-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="doctor-dashboard-layout">
        <aside className="doctor-sidebar">
          <h2>Patients</h2>
          {isLoadingPatients ? <p>Se incarca pacientii...</p> : null}
          {!isLoadingPatients && patients.length === 0 ? <p>Nu exista pacienti alocati.</p> : null}
          <ul>
            {patients.map((patient) => (
              <li key={patient.id}>
                <button
                  type="button"
                  className={selectedPatientId === patient.id ? "is-active" : ""}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <span>
                    {patient.firstname} {patient.lastname}
                  </span>
                  <small>{patient.diagnosis ?? "Fara diagnostic inregistrat"}</small>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="doctor-center">
          <h2>Vitals Overview</h2>
          {selectedPatient ? (
            <p className="doctor-selected-patient">
              Pacient selectat: {selectedPatient.firstname} {selectedPatient.lastname}
            </p>
          ) : (
            <p className="doctor-selected-patient">Selecteaza un pacient pentru a vedea valorile.</p>
          )}
          <div className="doctor-card-grid">
            <article className="doctor-card">
              <div className="doctor-card-title">
                <span className="doctor-icon doctor-icon-heart" aria-hidden>
                  ❤
                </span>
                <h3>Heart Rate (24h)</h3>
              </div>
              <span className="doctor-latest-badge doctor-latest-heart">
                {isLoadingVitals ? "..." : `${latestVitals?.heart_rate ?? "-"} BPM`}
              </span>
              <div className="doctor-chart-wrap">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartVitals}>
                    <defs>
                      <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="chartTimestamp" hide />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="heart_rate"
                      stroke="#ff4d4f"
                      fill="url(#heartGradient)"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>
            <article className="doctor-card">
              <div className="doctor-card-title">
                <span className="doctor-icon doctor-icon-gas" aria-hidden>
                  G
                </span>
                <h3>Gas Levels</h3>
              </div>
              <span className="doctor-latest-badge doctor-latest-gas">
                {isLoadingVitals ? "..." : `${latestVitals?.gas_detected ?? "-"}`}
              </span>
              <div className="doctor-chart-wrap">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartVitals}>
                    <defs>
                      <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#73d13d" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#73d13d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="chartTimestamp" hide />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="gas_detected"
                      stroke="#73d13d"
                      fill="url(#gasGradient)"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>
            <article className="doctor-card">
              <div className="doctor-card-title">
                <span className="doctor-icon doctor-icon-temp" aria-hidden>
                  T
                </span>
                <h3>Temperature Stability</h3>
              </div>
              <div className="doctor-temp-gauge">
                <div className="doctor-temp-ring">
                  <strong>{isLoadingVitals ? "--" : latestVitals?.ambient_temperature ?? "-"}</strong>
                  <span>C</span>
                </div>
                <p>Fluctuation: ±0.2 C</p>
              </div>
            </article>
            <article className="doctor-card">
              <div className="doctor-card-title">
                <span className="doctor-icon doctor-icon-log" aria-hidden>
                  R
                </span>
                <h3>Recent Logs</h3>
              </div>
              <ul className="doctor-logs-list">
                {recentLogs.map((log) => (
                  <li key={log.id}>
                    <time>{log.time}</time>
                    <span>{log.text}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <aside className="doctor-alerts">
          <h2>Active Alerts</h2>
          <div className="doctor-alert-filters">
            <label className="doctor-filter-field">
              <span>Severity</span>
              <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })}>
                <option value="">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label className="doctor-filter-field">
              <span>Status</span>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
              </select>
            </label>
            <label className="doctor-filter-field">
              <span>Time Range</span>
              <select value={filters.range} onChange={(e) => setFilters({ ...filters, range: e.target.value })}>
                <option value="">All</option>
                <option value="1h">Last 1 Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </label>
          </div>
          {loadingAlerts && <p>Loading alerts...</p>}
          {error && <p>{error}</p>}
          <ul>
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className={`doctor-alert-item ${
                  alert.status === "acknowledged" ? "doctor-alert-item--acknowledged" : "doctor-alert-item--active"
                }`}
              >
                <p>
                  {alert.alert_type} - {alert.severity} - {alert.status}
                </p>
                <p className="doctor-alert-patient">{getAlertPatientLabel(alert)}</p>
                <p className="doctor-alert-time">
                  {new Date(alert.timestamp).toLocaleString("ro-RO")}
                </p>
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={alert.status === "acknowledged"}
                  className={alert.status === "acknowledged" ? "doctor-alert-btn--resolved" : ""}
                >
                  {alert.status === "acknowledged" ? "Resolved" : "Acknowledge"}
                </button>
              </li>
            ))}
          </ul>
          {errorMessage ? <p className="doctor-error">{errorMessage}</p> : null}
        </aside>
      </main>
    </div>
  );
}
