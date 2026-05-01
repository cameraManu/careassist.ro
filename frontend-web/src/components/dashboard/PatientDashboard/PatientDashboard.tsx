import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchCurrentUser,
  fetchMeta,
  fetchVitals,
  type MetaResponse,
  type VitalsResponse
} from "../../../services/dashboard.service";
import "./PatientDashboard.css";

type LatestVitals = {
  heartRate: number | null;
  temperature: number | null;
  gasDetected: number | null;
};

function computeLatestVitals(records: VitalsResponse["records"]): LatestVitals {
  const latest = records[0];
  return {
    heartRate: latest?.heart_rate ?? null,
    temperature: latest?.ambient_temperature ?? null,
    gasDetected: latest?.gas_detected ?? null
  };
}

export function PatientDashboard(): React.JSX.Element {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = React.useState<string>("");
  const [meta, setMeta] = React.useState<MetaResponse | null>(null);
  const [vitals, setVitals] = React.useState<VitalsResponse["records"]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>("");

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
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load dashboard data");
      } finally {
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
    return <div className="patient-dashboard-state">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="patient-dashboard-state patient-dashboard-error">{error}</div>;
  }

  return (
    <div className="patient-dashboard-page">
      <header className="patient-dashboard-header">
        <div>
          <h1>CareAssist Dashboard</h1>
          <p>{userName}</p>
        </div>
        <button type="button" className="patient-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="patient-meta">
        <h2>Patient Info</h2>
        <p>Age: {meta?.age ?? "-"}</p>
        <p>Diagnosis: {meta?.diagnosis ?? "-"}</p>
      </section>

      <section className="patient-cards-grid">
        <article className="patient-metric-card">
          <h3>Heart Rate</h3>
          <strong>{latestVitals.heartRate ?? "-"} BPM</strong>
        </article>
        <article className="patient-metric-card">
          <h3>Gas Level</h3>
          <strong>{latestVitals.gasDetected ?? "-"}</strong>
        </article>
        <article className="patient-metric-card">
          <h3>Temperature</h3>
          <strong>{latestVitals.temperature ?? "-"} C</strong>
        </article>
      </section>

      <section className="patient-vitals-list">
        <h2>Latest 10 Readings</h2>
        <ul>
          {vitals.map((record) => (
            <li key={record.id}>
              <span>{new Date(record.timestamp).toLocaleString("ro-RO")}</span>
              <span>HR: {record.heart_rate ?? "-"}</span>
              <span>Temp: {record.ambient_temperature ?? "-"}</span>
              <span>Gas: {record.gas_detected ?? "-"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
