-- MariaDB schema for persisting feedback responses
-- Run as a privileged DB user, then grant least-privilege access to the API user.

CREATE DATABASE IF NOT EXISTS witchcraft_feedback
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE witchcraft_feedback;

CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(64) NOT NULL UNIQUE,
  PRIMARY KEY (id),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_ages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  age_category VARCHAR(64) NOT NULL UNIQUE,
  PRIMARY KEY (id),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_genders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  gender_name VARCHAR(64) NOT NULL UNIQUE,
  PRIMARY KEY (id),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS technology_locations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  location_name VARCHAR(64) NOT NULL UNIQUE,
  PRIMARY KEY (id),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS technology_languages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  language_name VARCHAR(64) NOT NULL UNIQUE,
  PRIMARY KEY (id),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS technology_computers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  computer_name VARCHAR(64) NOT NULL UNIQUE,
  PRIMARY KEY (id),
  UNIQUE KEY idx_computer_name (computer_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS technology_browsers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  browser_name VARCHAR(64) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_yesno (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  yesno_value VARCHAR(16) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_num_lessons (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  num_lessons_category  VARCHAR(16) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_durations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  duration_category VARCHAR(16) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_enjoyments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  enjoyment_value VARCHAR(16) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_difficulties (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  difficulty_value VARCHAR(16) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_responses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recipient_to VARCHAR(320) NOT NULL,
  recipient_cc VARCHAR(320) NULL,
  subject VARCHAR(255) NOT NULL,
  feedback_payload JSON NULL,
  email_status VARCHAR(16) NOT NULL DEFAULT 'pending',
  email_message_id VARCHAR(255) NULL,
  email_error TEXT NULL,
  request_ip VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  PRIMARY KEY (id),
  INDEX idx_feedback_created_at (created_at),
  INDEX idx_feedback_email_status (email_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_response_id BIGINT UNSIGNED NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role BIGINT UNSIGNED NULL,
  user_age BIGINT UNSIGNED NULL,
  user_gender BIGINT UNSIGNED NULL,
  course_helpful BIGINT UNSIGNED NULL,
  course_num_lessons BIGINT UNSIGNED NULL,
  course_duration BIGINT UNSIGNED NULL,
  course_enjoyment BIGINT UNSIGNED NULL,
  course_actual_difficulty BIGINT UNSIGNED NULL,
  course_desired_difficulty BIGINT UNSIGNED NULL,
  text_like TEXT NULL,
  text_dislike TEXT NULL,
  text_learning TEXT NULL,
  text_missing TEXT NULL,
  text_other TEXT NULL,
  consent BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_response (feedback_response_id),
  FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_role) REFERENCES user_roles(id) ON DELETE SET NULL,
  FOREIGN KEY (user_age) REFERENCES user_ages(id) ON DELETE SET NULL,
  FOREIGN KEY (user_gender) REFERENCES user_genders(id) ON DELETE SET NULL,
  FOREIGN KEY (course_helpful) REFERENCES course_yesno(id) ON DELETE SET NULL,
  FOREIGN KEY (course_num_lessons) REFERENCES course_num_lessons(id) ON DELETE SET NULL,
  FOREIGN KEY (course_duration) REFERENCES course_durations(id) ON DELETE SET NULL,
  FOREIGN KEY (course_enjoyment) REFERENCES course_enjoyments(id) ON DELETE SET NULL,
  FOREIGN KEY (course_actual_difficulty) REFERENCES course_difficulties(id) ON DELETE SET NULL,
  FOREIGN KEY (course_desired_difficulty) REFERENCES course_difficulties(id) ON DELETE SET NULL,
  FOREIGN KEY (consent) REFERENCES course_yesno(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_locations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_response_id BIGINT UNSIGNED NOT NULL,
  technology_location_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_locations_response_location (feedback_response_id, technology_location_id),
  FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (technology_location_id) REFERENCES technology_locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_languages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_response_id BIGINT UNSIGNED NOT NULL,
  technology_language_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_languages_response_language (feedback_response_id, technology_language_id),
  FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (technology_language_id) REFERENCES technology_languages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_computers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_response_id BIGINT UNSIGNED NOT NULL,
  technology_computer_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_computers_response_computer (feedback_response_id, technology_computer_id),
  FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (technology_computer_id) REFERENCES technology_computers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_browsers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_response_id BIGINT UNSIGNED NOT NULL,
  technology_browser_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_browsers_response_browser (feedback_response_id, technology_browser_id),
  FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (technology_browser_id) REFERENCES technology_browsers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_roles_others (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_response_id BIGINT UNSIGNED NOT NULL,
  other_role VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_roles_others_response_role (feedback_response_id, other_role),
  FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_locations_others (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_response_id BIGINT UNSIGNED NOT NULL,
  other_location VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_locations_others_response_location (feedback_response_id, other_location),
  FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_languages_others (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_response_id BIGINT UNSIGNED NOT NULL,
  other_language VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_languages_others_response_language (feedback_response_id, other_language),
  FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_computers_others (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_response_id BIGINT UNSIGNED NOT NULL,
  other_computer VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_computers_others_response_computer (feedback_response_id, other_computer),
  FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_browsers_others (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feedback_response_id BIGINT UNSIGNED NOT NULL,
  other_browser VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_browsers_others_response_browser (feedback_response_id, other_browser),
  FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure uniqueness constraints exist when rerunning against an existing database.
ALTER TABLE feedback
  ADD UNIQUE KEY IF NOT EXISTS uq_feedback_response (feedback_response_id);

ALTER TABLE feedback_locations
  ADD UNIQUE KEY IF NOT EXISTS uq_feedback_locations_response_location (feedback_response_id, technology_location_id);

ALTER TABLE feedback_languages
  ADD UNIQUE KEY IF NOT EXISTS uq_feedback_languages_response_language (feedback_response_id, technology_language_id);

ALTER TABLE feedback_computers
  ADD UNIQUE KEY IF NOT EXISTS uq_feedback_computers_response_computer (feedback_response_id, technology_computer_id);

ALTER TABLE feedback_browsers
  ADD UNIQUE KEY IF NOT EXISTS uq_feedback_browsers_response_browser (feedback_response_id, technology_browser_id);

ALTER TABLE feedback_roles_others
  ADD UNIQUE KEY IF NOT EXISTS uq_feedback_roles_others_response_role (feedback_response_id, other_role);

ALTER TABLE feedback_locations_others
  ADD UNIQUE KEY IF NOT EXISTS uq_feedback_locations_others_response_location (feedback_response_id, other_location);

ALTER TABLE feedback_languages_others
  ADD UNIQUE KEY IF NOT EXISTS uq_feedback_languages_others_response_language (feedback_response_id, other_language);

ALTER TABLE feedback_computers_others
  ADD UNIQUE KEY IF NOT EXISTS uq_feedback_computers_others_response_computer (feedback_response_id, other_computer);

ALTER TABLE feedback_browsers_others
  ADD UNIQUE KEY IF NOT EXISTS uq_feedback_browsers_others_response_browser (feedback_response_id, other_browser);

-- Least-privilege application user grants
CREATE USER IF NOT EXISTS 'witchcraft_api'@'%' IDENTIFIED BY 'replace-with-strong-password';
GRANT SELECT, INSERT, UPDATE ON witchcraft_feedback.* TO 'witchcraft_api'@'%';
FLUSH PRIVILEGES;

INSERT IGNORE INTO user_roles (role_name) VALUES
  ('Student'),
  ('Mentor'),
  ('Parent'),
  ('Teacher'),
  ('Other');

INSERT IGNORE INTO user_ages (age_category) VALUES
  ('0-7 years old'),
  ('8-9 years old'),
  ('10-11 years old'),
  ('12-13 years old'),
  ('14-15 years old'),
  ('16-17 years old'),
  ('18-24 years old'),
  ('25-60 years old'),
  ('61 years or older');

INSERT IGNORE INTO user_genders (gender_name) VALUES
  ('Witch'),
  ('Wizard'),
  ('Neither'),
  ('Prefer not to say');

INSERT IGNORE INTO technology_locations (location_name) VALUES
  ('At a Coder Dojo or coding club'),
  ('At school'),
  ('At home'),
  ('At a library'),
  ('Other');

INSERT IGNORE INTO technology_languages (language_name) VALUES
  ('None'),
  ('Scratch'),
  ('Python'),
  ('HTML'),
  ('CSS'),
  ('JavaScript'),
  ('Other');

INSERT IGNORE INTO technology_computers (computer_name) VALUES
  ('Coder Dojo Club Laptop'),
  ('Windows Computer'),
  ('Mac Computer'),
  ('Linux Computer'),
  ('Tablet'),
  ('Mobile Phone'),
  ('Chromebook'),
  ('Other');

INSERT IGNORE INTO technology_browsers (browser_name) VALUES
  ('Mozilla Firefox'),
  ('Google Chrome'),
  ('Microsoft Edge'),
  ('Apple Safari'),
  ('Opera'),
  ('Other');

INSERT IGNORE INTO course_yesno (yesno_value) VALUES
  ('Yes'),
  ('No');
  
INSERT IGNORE INTO course_num_lessons (num_lessons_category) VALUES
  ('1-5 lessons'),
  ('6-10 lessons'),
  ('11-20 lessons'),
  ('21-30 lessons'),
  ('Over 30 lessons');

INSERT IGNORE INTO course_durations (duration_category) VALUES
  ('Less than an hour'),
  ('1-2 hours'),
  ('3-4 hours'),
  ('5-6 hours'),
  ('7-8 hours'),
  ('More than 8 hours');

INSERT IGNORE INTO course_enjoyments (enjoyment_value) VALUES
  ('Not at all - course was terrible'),
  ('Mostly hated it'),
  ('Hated bits of it'),
  ('So so'),
  ('Enjoyed bits of it'),
  ('Enjoyed most of it'),
  ('Enjoyed it all - course was brilliant');

INSERT IGNORE INTO course_difficulties (difficulty_value) VALUES
  ('Very easy'),
  ('Quite easy'),
  ('Somewhat easy'),
  ('Just right'),
  ('Somewhat difficult'),
  ('Quite difficult'),
  ('Very difficult'),
  ('Impossible');