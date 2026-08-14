-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'employee',
  phone TEXT,
  address TEXT,
  age TEXT,
  gender TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Calendar Events Table (for holidays and working days)
CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT UNIQUE NOT NULL, -- YYYY-MM-DD
  status TEXT NOT NULL, -- 'holiday' or 'working'
  updated_by TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin
INSERT OR IGNORE INTO users (fullName, email, password, role) VALUES ('Admin', 'admin@test.com', 'admin', 'admin');

-- Attendance Logs Table
CREATE TABLE IF NOT EXISTS attendance_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  check_in_time DATETIME,
  check_out_time DATETIME,
  status TEXT DEFAULT 'Present', -- 'Present', 'Late', 'Absent' (set at check-in, never changed)
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Employee Attendance Detail (Summary Table)
CREATE TABLE IF NOT EXISTS employee_attendance_detail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  total_working_days INTEGER DEFAULT 0,
  total_working_hour REAL DEFAULT 0,
  total_present INTEGER DEFAULT 0,
  total_absent INTEGER DEFAULT 0,
  total_late INTEGER DEFAULT 0,
  total_leave INTEGER DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  LQM TEXT NOT NULL,
  leave_days INTEGER NOT NULL,
  approval INTEGER DEFAULT NULL, -- NULL = Pending, 0 = Rejected, 1 = Approved
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
