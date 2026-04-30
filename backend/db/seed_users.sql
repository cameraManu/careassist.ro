USE carreassist;

INSERT INTO devices (id, description, sensor_list, date_installed)
VALUES
  (
    1,
    'Kit senzori dormitor pacient',
    JSON_OBJECT('heart_rate', true, 'ambient_temperature', true, 'ambient_humidity', true, 'gas_detected', true),
    NOW()
  )
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO users (id, username, email, firstname, lastname, password, device_id, permission_level)
VALUES
  (100, 'patient_demo', 'patient_demo@careassist.ro', 'Patient', 'Demo', '$2a$10$wpDZCZab670DPHfesUTwFeotvVpglDLVko.sKnjND5FyPWvhmYjKK', 1, 0),
  (101, 'doctor_demo', 'doctor_demo@careassist.ro', 'Doctor', 'Demo', '$2a$10$wpDZCZab670DPHfesUTwFeotvVpglDLVko.sKnjND5FyPWvhmYjKK', NULL, 1),
  (102, 'supervisor_demo', 'supervisor_demo@careassist.ro', 'Supervisor', 'Demo', '$2a$10$wpDZCZab670DPHfesUTwFeotvVpglDLVko.sKnjND5FyPWvhmYjKK', NULL, 2),
  (103, 'caregiver_demo', 'caregiver_demo@careassist.ro', 'Caregiver', 'Demo', '$2a$10$wpDZCZab670DPHfesUTwFeotvVpglDLVko.sKnjND5FyPWvhmYjKK', 1, 3),
  (104, 'admin_demo', 'admin_demo@careassist.ro', 'Admin', 'Demo', '$2a$10$wpDZCZab670DPHfesUTwFeotvVpglDLVko.sKnjND5FyPWvhmYjKK', NULL, 4)
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  email = VALUES(email),
  firstname = VALUES(firstname),
  lastname = VALUES(lastname),
  password = VALUES(password),
  device_id = VALUES(device_id),
  permission_level = VALUES(permission_level);

INSERT INTO meta_users (cnp, user_id, diagnosis, age, home_address, phone, mail)
VALUES
  ('5000101000001', 100, 'Hipertensiune', 71, 'Str. Pacientului 1', '0700000001', 'patient@careassist.ro'),
  ('5000101000002', 101, 'Medic cardiolog', 45, 'Str. Medicului 2', '0700000002', 'doctor@careassist.ro'),
  ('5000101000003', 102, 'Coordonator tura', 42, 'Str. Supervisor 3', '0700000003', 'supervisor@careassist.ro'),
  ('5000101000004', 103, 'Asistenta la domiciliu', 39, 'Str. Caregiver 4', '0700000004', 'caregiver@careassist.ro'),
  ('5000101000005', 104, 'Administrator platforma', 36, 'Str. Admin 5', '0700000005', 'admin@careassist.ro')
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  diagnosis = VALUES(diagnosis),
  age = VALUES(age),
  home_address = VALUES(home_address),
  phone = VALUES(phone),
  mail = VALUES(mail);
