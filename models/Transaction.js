const pool = require('../config/db');

class Transaction {
  static async getByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
    return rows;
  }

  static async create(userId, description, amount, type, category) {
    const [result] = await pool.execute(
      `INSERT INTO transactions (user_id, description, amount, type, category)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, description, amount, type, category]
    );
    const [rows] = await pool.execute('SELECT * FROM transactions WHERE id = ?', [
      result.insertId,
    ]);
    return rows[0] || null;
  }

  static async delete(transactionId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Transaction;
