USE careassist;

INSERT INTO devices (id, description, sensor_list, date_installed)
VALUES
  (
    1,
    'Kit senzori dormitor pacient',
    JSON_OBJECT('heart_rate', true, 'ambient_temperature', true, 'ambient_humidity', true, 'gas_detected', true),
    NOW()
  )
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO users (
  id,
  firstname,
  lastname,
  username,
  email,
  password,
  device_id,
  permission_level,
  creation_date,
  deleted,
  assigned_doctor_id
)
VALUES
  (1, 'Roxana', 'Daraban', 'roxana.daraban', 'roxana@careassist.ro', '$2a$10$0mI7IacXT9ikDv31wSNNzeeF81wry7lkZrNzMD/0LLjqcetyzNc82', 1, 1, NOW(), NULL, 2),
  (2, 'doctor', 'Marcel', 'doctor.marcel', 'marcel@med.careassist.ro', '$2a$10$0mI7IacXT9ikDv31wSNNzeeF81wry7lkZrNzMD/0LLjqcetyzNc82', NULL, 2, NOW(), NULL, NULL),
  (3, 'Mihai', 'Ignat', 'mihai.ignat', 'mihai@careassist.ro', '$2a$10$0mI7IacXT9ikDv31wSNNzeeF81wry7lkZrNzMD/0LLjqcetyzNc82', 2, 1, NOW(), NULL, 2),
  (4, 'supervisor', 'Andrei', 'supervisor.andrei', 'andrei@staff.careassist.ro', '$2a$10$0mI7IacXT9ikDv31wSNNzeeF81wry7lkZrNzMD/0LLjqcetyzNc82', NULL, 3, NOW(), NULL, NULL),
  (5, 'admin', 'Root', 'admin.root', 'admin@careassist.ro', '$2a$10$0mI7IacXT9ikDv31wSNNzeeF81wry7lkZrNzMD/0LLjqcetyzNc82', NULL, 4, NOW(), NULL, NULL)
ON DUPLICATE KEY UPDATE
  firstname = VALUES(firstname),
  lastname = VALUES(lastname),
  username = VALUES(username),
  email = VALUES(email),
  password = VALUES(password),
  device_id = VALUES(device_id),
  permission_level = VALUES(permission_level),
  deleted = VALUES(deleted),
  assigned_doctor_id = VALUES(assigned_doctor_id);

INSERT INTO meta_users (cnp, user_id, diagnosis, age, home_address, phone, mail)
VALUES
  ('5000101000001', 1, 'Hipertensiune', 71, 'Str. Pacientului 1', '0700000001', 'roxana@careassist.ro'),
  ('5000101000002', 2, 'Medic cardiolog', 45, 'Str. Medicului 2', '0700000002', 'marcel@med.careassist.ro'),
  ('5000101000003', 3, 'Recuperare post-operatorie', 69, 'Str. Pacientului 3', '0700000003', 'mihai@careassist.ro'),
  ('5000101000004', 4, 'Coordonator tura', 42, 'Str. Supervisor 4', '0700000004', 'andrei@staff.careassist.ro'),
  ('5000101000005', 5, 'Administrator platforma', 36, 'Str. Admin 5', '0700000005', 'admin@careassist.ro')
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  diagnosis = VALUES(diagnosis),
  age = VALUES(age),
  home_address = VALUES(home_address),
  phone = VALUES(phone),
  mail = VALUES(mail);
