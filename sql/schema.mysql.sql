-- FinTrack Pro schema (MySQL 8+)
-- Notes:
-- - Uses InnoDB and FK constraints.
-- - MySQL CHECK constraints are enforced in 8.0.16+; keep app-side validation too.

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  monthly_budget DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(16) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_transactions_type CHECK (type IN ('income','expense')),
  KEY idx_transactions_user_date (user_id, date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  limit_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_budgets_user_category (user_id, category),
  KEY idx_budgets_user (user_id)
) ENGINE=InnoDB;

