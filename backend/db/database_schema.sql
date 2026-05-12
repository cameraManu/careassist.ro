CREATE DATABASE IF NOT EXISTS careassist
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE careassist;

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  sensor_list JSON NOT NULL,
  date_installed DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  device_id INT NULL,
  permission_level INT NOT NULL,
  creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted DATETIME NULL,
  assigned_doctor_id INT NULL,
  CONSTRAINT chk_users_permission_level CHECK (permission_level BETWEEN 0 AND 4),
  CONSTRAINT fk_users_device FOREIGN KEY (device_id)
    REFERENCES devices(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_users_assigned_doctor FOREIGN KEY (assigned_doctor_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS meta_users (
  cnp VARCHAR(13) PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  diagnosis VARCHAR(255) NULL,
  age INT NULL,
  home_address VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  mail VARCHAR(150) NULL,
  CONSTRAINT fk_meta_users_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS values (
  lid INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  heart_rate FLOAT NULL,
  ambient_light FLOAT NULL,
  ambient_temperature FLOAT NULL,
  ambient_humidity FLOAT NULL,
  gas_detected FLOAT NULL,
  INDEX idx_values_device_time (device_id, timestamp),
  CONSTRAINT fk_values_device FOREIGN KEY (device_id)
    REFERENCES devices(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS manual_values (
  lid INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  measurement VARCHAR(100) NOT NULL,
  value FLOAT NOT NULL,
  INDEX idx_manual_values_user_time (user_id, timestamp),
  CONSTRAINT fk_manual_values_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
  lid INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NULL,
  user_id INT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  acknowledged_at DATETIME NULL,
  acknowledged_by INT NULL,
  INDEX idx_alerts_timestamp (timestamp),
  INDEX idx_alerts_user (user_id),
  INDEX idx_alerts_device (device_id),
  INDEX idx_alerts_status_timestamp (status, timestamp),
  CONSTRAINT fk_alerts_device FOREIGN KEY (device_id)
    REFERENCES devices(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_alerts_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_alerts_acknowledged_by FOREIGN KEY (acknowledged_by)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);
