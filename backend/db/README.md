# Database setup (CareAssist backend)

This folder contains the baseline schema, versioned migrations, and seed scripts.

## Files

- `database_schema.sql` - full schema snapshot for fresh environments
- `migrations/` - incremental SQL updates for existing databases
- `seed_users.sql` - base users/devices/meta demo data
- `seeds/001_seed_demo_alerts.sql` - doctor alerts demo data

## Current migration set

1. `001_add_assigned_doctor_to_users.sql`
2. `002_create_or_update_alerts.sql`
3. `003_add_identity_columns_to_users.sql`

## Recommended order on a fresh local setup

1. Run `database_schema.sql`
2. Run all files in `migrations/` in numeric order
3. Run `seed_users.sql`
4. Run `seeds/001_seed_demo_alerts.sql`

## Recommended order on an existing local setup

1. Run all files in `migrations/` in numeric order
2. Run `seed_users.sql` if you need demo users refreshed
3. Run `seeds/001_seed_demo_alerts.sql` for alert flow testing

## Notes

- Migrations are written to be safe on repeated execution where possible.
- Alert flows in the backend require:
  - `users.assigned_doctor_id`
  - `alerts.status`
  - `alerts.acknowledged_at`
  - `alerts.acknowledged_by`
- Auth/register flows require:
  - `users.username`
  - `users.email`
  - `users.creation_date`
  - `users.deleted`
