const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'FinTrack_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

async function initSchema() {
  const conn = await pool.getConnection();
  try {
    // Create Users Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Transactions Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create Budgets Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        limit_amount DECIMAL(12,2) NOT NULL,
        UNIQUE KEY unique_user_category (user_id, category),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ MySQL Schema Initialized");
  } finally {
    conn.release();
  }
}

module.exports = pool;
module.exports.initSchema = initSchema;