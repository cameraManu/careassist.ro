import React from "react";
import type {
  AlertsTable,
  SeverityLevel,
  UsersTable,
  ValuesTable,
} from "../../shared/src/db.types.js";
import "./Dashboard.css";
import { useState, useEffect } from "react";
import { getApiV1BaseUrl } from "./config/apiBaseUrl.js";

interface PatientSummary {
  user: Pick<UsersTable, "id" | "firstname" | "lastname">;
  status: "Stable" | "Observation" | "Alert";
  alertText?: string;
}

interface ActivityLogItem {
  id: string;
  text: string;
  timestamp: string;
}

const patients: PatientSummary[] = [
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

const activityLogs: ActivityLogItem[] = [
  { id: "a1", text: "Routine vitals check performed", timestamp: "14:30:12" },
  { id: "a2", text: "Dosage adjustment: Atenolol 25mg", timestamp: "11:15:00" },
  { id: "a3", text: "Patient sleep cycle detected", timestamp: "23:45:05" },
];

const alerts: AlertsTable[] = [
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

function severityLabel(severity: SeverityLevel): string {
  if (severity === "critical") return "Critical";
  if (severity === "high") return "High";
  if (severity === "medium") return "Medium";
  return "Low";
}

// Mock function to determine patient status - can be replaced with actual data
function getPatientStatus(userId: number): PatientSummary["status"] {
  const statuses: ("Stable" | "Observation" | "Alert")[] = [
    "Stable",
    "Observation",
    "Alert",
  ];
  return statuses[userId % 3];
}

export function Dashboard(): React.JSX.Element {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(
    null,
  );
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const apiUrl = getApiV1BaseUrl();
        const response = await fetch(`${apiUrl}/patients`);
        const data = await response.json();

        const patientSummaries: PatientSummary[] = data.map(
          (user: Pick<UsersTable, "id" | "firstname" | "lastname">) => ({
            user,
            status: getPatientStatus(user.id),
            alertText: undefined,
          }),
        );

        setPatients(patientSummaries);
        if (patientSummaries.length > 0) {
          setSelectedPatient(patientSummaries[0]);
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const latestVitals: Pick<
    ValuesTable,
    "heart_rate" | "ambient_temperature" | "gas_detected"
  > = {
    heart_rate: 72,
    ambient_temperature: 36.6,
    gas_detected: 98,
  };

  function handleSelectPatient(patient: PatientSummary): void {
    setSelectedPatient(patient);
  }

  const filteredPatients = patients.filter((patient) => {
    const fullName =
      `${patient.user.firstname} ${patient.user.lastname}`.toLowerCase();
    return fullName.includes(searchText.toLowerCase());
  });

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand-wrap">
          <div className="brand-icon">+</div>
          <h1>CareAssist</h1>
        </div>
        <nav className="header-actions">
          <a href="#thresholds">Set Thresholds</a>
          <a className="primary" href="#prescriptions">
            + Add Prescription
          </a>
          <div className="profile-dot" />
        </nav>
      </header>

      <main className="dashboard-layout">
        <aside className="left-sidebar">
          <div className="sidebar-title-row">
            <h2>Patient Directory</h2>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <ul className="patient-list">
            {filteredPatients.map((patient) => (
              <li key={patient.user.id}>
                <button
                  className={`patient-btn ${patient === selectedPatient ? "active" : ""} ${patient.status.toLowerCase()}`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <span className="patient-name">
                    {patient.user.firstname} {patient.user.lastname}
                  </span>
                  <span
                    className={`patient-status ${patient.status.toLowerCase()}`}
                  >
                    {patient.alertText ?? patient.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="center-panel">
          <div className="panel-head">
            <div>
              <h2>
                {selectedPatient?.user.firstname}{" "}
                {selectedPatient?.user.lastname}
              </h2>
              <p>ID: #{selectedPatient?.user.id} | Ward 4, Room 12</p>
            </div>
            <span className="status-pill">{selectedPatient?.status}</span>
          </div>

          <div className="cards-grid">
            <article className="card">
              <div className="card-head">
                <h3>Heart Rate History (24h)</h3>
                <strong>{latestVitals.heart_rate} BPM</strong>
              </div>
              <div className="chart-placeholder red">Chart placeholder</div>
            </article>

            <article className="card">
              <div className="card-head">
                <h3>Room Gas Levels</h3>
                <strong>{latestVitals.gas_detected}% O2</strong>
              </div>
              <div className="chart-placeholder blue">Chart placeholder</div>
            </article>
          </div>

          <div className="bottom-grid">
            <article className="card compact">
              <h3>Temperature Stability</h3>
              <div className="temperature-circle">
                {latestVitals.ambient_temperature} C
              </div>
              <p>Fluctuation: +-0.2 C</p>
            </article>

            <article className="card logs">
              <h3>Recent Activity Logs</h3>
              <ul>
                {activityLogs.map((item) => (
                  <li key={item.id}>
                    <span>{item.text}</span>
                    <time>{item.timestamp}</time>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <aside className="right-sidebar">
          <h2>Active Emergency Alerts</h2>
          <div className="alerts-wrap">
            {alerts.map((alert) => (
              <article key={alert.lid} className="alert-card">
                <p className="alert-severity">
                  {severityLabel(alert.severity)}: {alert.alert_type}
                </p>
                <p className="alert-meta">
                  User #{alert.user_id ?? "-"} | Device #
                  {alert.device_id ?? "-"}
                </p>
                <p className="alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString("ro-RO")}
                </p>
                <button type="button">Acknowledge</button>
              </article>
            ))}
          </div>
          <div className="server-status">
            Server Status: Online | Low Latency
          </div>
        </aside>
      </main>
    </div>
  );
}
