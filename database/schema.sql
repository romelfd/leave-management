-- Employee Leave Management — MySQL schema
CREATE DATABASE IF NOT EXISTS leave_management;
USE leave_management;

DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  department    VARCHAR(100) NOT NULL,
  manager_id    INT NULL,
  leave_balance INT NOT NULL DEFAULT 15,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);

CREATE TABLE leave_requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT NOT NULL,
  leave_type      ENUM('vacation','sick','unpaid','bereavement') NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  days_requested  INT NOT NULL,
  status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reason          VARCHAR(500),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by     INT NULL,
  reviewed_at     TIMESTAMP NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (reviewed_by) REFERENCES employees(id),
  CHECK (end_date >= start_date),
  CHECK (days_requested > 0)
);

CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);

-- Seed data
INSERT INTO employees (first_name, last_name, email, department, manager_id, leave_balance) VALUES
('Ana',    'Reyes',  'ana.reyes@company.com',    'Engineering', NULL, 15),
('Miguel', 'Santos', 'miguel.santos@company.com','Engineering', 1,    12),
('Liza',   'Cruz',   'liza.cruz@company.com',    'Design',      1,    18),
('Ben',    'Tan',    'ben.tan@company.com',      'QA',          1,    10);

INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, status, reason) VALUES
(2, 'vacation', '2026-10-05', '2026-10-09', 5, 'pending',  'Family trip'),
(3, 'sick',     '2026-09-20', '2026-09-21', 2, 'approved', 'Flu'),
(4, 'unpaid',   '2026-11-01', '2026-11-03', 3, 'pending',  'Personal matters');
