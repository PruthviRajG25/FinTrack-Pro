const pool = require('../config/db');

const Budget = {
  updateLimit: async (userId, category, limitAmount) => {
    await pool.execute(
      `INSERT INTO budgets (user_id, category, limit_amount)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE limit_amount = VALUES(limit_amount)`,
      [userId, category, limitAmount]
    );
    const [rows] = await pool.execute(
      'SELECT * FROM budgets WHERE user_id = ? AND category = ?',
      [userId, category]
    );
    return rows[0] || null;
  },

  getLimits: async (userId) => {
    const [rows] = await pool.execute(
      'SELECT category, limit_amount FROM budgets WHERE user_id = ? ORDER BY category',
      [userId]
    );
    return rows;
  },

  deleteByCategory: async (userId, category) => {
    const [result] = await pool.execute(
      'DELETE FROM budgets WHERE user_id = ? AND category = ?',
      [userId, category]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Budget;
