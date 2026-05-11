# Phase 1 smoke checklist (DB + backend alerts)

Run this after schema/migrations/seeds to confirm the backend data layer is stable.

## 1) SQL sanity checks

```sql
USE careassist;

SHOW COLUMNS FROM users LIKE 'assigned_doctor_id';
SHOW COLUMNS FROM users LIKE 'username';
SHOW COLUMNS FROM users LIKE 'email';

SHOW COLUMNS FROM alerts LIKE 'status';
SHOW COLUMNS FROM alerts LIKE 'acknowledged_at';
SHOW COLUMNS FROM alerts LIKE 'acknowledged_by';
```

Expected: each query returns one row.

## 2) Data sanity checks

```sql
SELECT id, firstname, lastname, permission_level, assigned_doctor_id, device_id
FROM users
ORDER BY id;

SELECT lid, user_id, device_id, alert_type, severity, status, acknowledged_at, acknowledged_by
FROM alerts
ORDER BY lid DESC;
```

Expected:
- doctor user exists (e.g. Marcel)
- at least 2 patients are assigned to the doctor
- alerts table has both `active` and `acknowledged` test rows

## 3) API checks (manual/Postman)

### A) Login as doctor

- `POST /api/v1/auth/login`
- save bearer token

### B) Doctor sees assigned patients

- `GET /api/v1/doctor/patients`
- with `Authorization: Bearer <token>`
- expected: patient list is returned

### C) Doctor sees alerts

- `GET /api/v1/doctor/alerts`
- expected: alert list with patient names

### D) Alert filtering works

- `GET /api/v1/doctor/alerts?severity=high`
- `GET /api/v1/doctor/alerts?status=active`
- `GET /api/v1/doctor/alerts?range=24h`
- expected: filtered subsets

### E) Acknowledge updates only one alert

- choose one active alert `lid`
- `PATCH /api/v1/alerts/:lid/acknowledge`
- expected:
  - response 200
  - status changes to `acknowledged` for that row only
  - second PATCH on same alert returns 409

## 4) Build check

```bash
cd backend && npm run build
cd ../frontend-web && npm run build
```

Expected: both succeed.
