CREATE TABLE IF NOT EXISTS Notification (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  officer_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (officer_id) REFERENCES Officer(officer_id)
);
