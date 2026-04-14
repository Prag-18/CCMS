-- =============================================================
-- CCMS — Crime & Case Management System
-- Full Database Schema (corrected & backend-aligned)
-- Run this once on a fresh database to create all tables.
-- =============================================================

CREATE DATABASE IF NOT EXISTS CCMS;
USE CCMS;

-- =========================
-- 1. OFFICER TABLE
-- =========================
CREATE TABLE IF NOT EXISTS Officer (
  officer_id   INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  email        VARCHAR(100)  UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('ADMIN', 'OFFICER', 'INVESTIGATOR') NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. LOCATION TABLE
-- =========================
CREATE TABLE IF NOT EXISTS Location (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  area_name   VARCHAR(100),
  latitude    DECIMAL(10, 6),
  longitude   DECIMAL(10, 6)
);

-- =========================
-- 3. CRIME TABLE
-- =========================
CREATE TABLE IF NOT EXISTS Crime (
  crime_id    INT AUTO_INCREMENT PRIMARY KEY,
  crime_type  VARCHAR(100),
  description TEXT,
  location_id INT,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (location_id) REFERENCES Location(location_id)
);

-- =========================
-- 4. CASE FILE TABLE
-- =========================
CREATE TABLE IF NOT EXISTS CaseFile (
  case_id               INT AUTO_INCREMENT PRIMARY KEY,
  case_number           VARCHAR(50) UNIQUE,
  crime_id              INT,
  title                 VARCHAR(255),
  assigned_officer_id   INT,
  status                ENUM('OPEN', 'IN_PROGRESS', 'CLOSED') DEFAULT 'OPEN',
  priority              VARCHAR(20),
  station_id            INT,
  created_by_officer_id INT,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (crime_id)              REFERENCES Crime(crime_id),
  FOREIGN KEY (assigned_officer_id)   REFERENCES Officer(officer_id),
  FOREIGN KEY (created_by_officer_id) REFERENCES Officer(officer_id)
);

-- =========================
-- 5. VICTIM TABLE
-- =========================
CREATE TABLE IF NOT EXISTS Victim (
  victim_id      INT AUTO_INCREMENT PRIMARY KEY,
  full_name      VARCHAR(100),
  contact_number VARCHAR(20),
  address        TEXT,
  age            INT,
  gender         ENUM('MALE', 'FEMALE', 'OTHER'),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 6. CRIME-VICTIM RELATION
-- =========================
CREATE TABLE IF NOT EXISTS CrimeVictim (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  crime_id   INT,
  victim_id  INT,

  FOREIGN KEY (crime_id)  REFERENCES Crime(crime_id),
  FOREIGN KEY (victim_id) REFERENCES Victim(victim_id)
);

-- =========================
-- 7. EVIDENCE TABLE
-- (columns aligned with backend evidence repository)
-- =========================
CREATE TABLE IF NOT EXISTS Evidence (
  evidence_id          INT AUTO_INCREMENT PRIMARY KEY,
  case_id              INT,
  evidence_type        ENUM('DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER') DEFAULT 'DOCUMENT',
  description          TEXT,
  file_name            VARCHAR(255),
  file_path            VARCHAR(255),
  mime_type            VARCHAR(100),
  file_size            BIGINT,
  uploaded_by_officer_id INT,
  status               ENUM('PENDING', 'IN_ANALYSIS', 'VERIFIED', 'PROCESSED', 'UNKNOWN') DEFAULT 'PENDING',
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (case_id)                REFERENCES CaseFile(case_id),
  FOREIGN KEY (uploaded_by_officer_id) REFERENCES Officer(officer_id)
);

-- =========================
-- 8. CASE ACTIVITY (TIMELINE)
-- =========================
CREATE TABLE IF NOT EXISTS CaseActivity (
  case_activity_id INT AUTO_INCREMENT PRIMARY KEY,
  case_id          INT,
  activity_type    VARCHAR(100),
  notes            TEXT,
  actor_officer_id INT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (case_id)          REFERENCES CaseFile(case_id),
  FOREIGN KEY (actor_officer_id) REFERENCES Officer(officer_id)
);

-- =========================
-- 9. NOTIFICATION TABLE
-- =========================
CREATE TABLE IF NOT EXISTS Notification (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  officer_id      INT NOT NULL,
  message         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (officer_id) REFERENCES Officer(officer_id)
);
