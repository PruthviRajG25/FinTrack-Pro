const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, name, monthly_budget, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByIdWithPassword(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(email, password, name) {
    const [existingRows] = await pool.execute('SELECT id FROM users WHERE email = ?', [
      email,
    ]);
    if (existingRows.length > 0) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );
    const [rows] = await pool.execute('SELECT id, email, name FROM users WHERE id = ?', [
      result.insertId,
    ]);
    return rows[0];
  }

  static async updateName(id, name) {
    const [result] = await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, id]);
    if (result.affectedRows === 0) return null;
    const [rows] = await pool.execute('SELECT id, email, name FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.execute('UPDATE users SET password = ? WHERE id = ?', [
      hashed,
      id,
    ]);
    return result.affectedRows > 0;
  }

  static async verifyPassword(hashedPassword, plainPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
