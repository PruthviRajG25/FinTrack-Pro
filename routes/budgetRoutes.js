const express = require('express');
const Budget = require('../models/Budget');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Upsert a budget limit (Create or Update)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { category, limit_amount } = req.body;

    if (!category || limit_amount === undefined || limit_amount === null) {
      return res.status(400).json({ error: 'category and limit_amount are required' });
    }

    await Budget.updateLimit(req.userId, category, limit_amount);
    return res.status(200).json({ message: 'Budget limit updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update budget' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.getLimits(req.userId);
    return res.json(budgets);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Delete a budget by category
router.delete('/:category', verifyToken, async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category || '').trim();

    if (!category) {
      return res.status(400).json({ error: 'category is required' });
    }

    const deleted = await Budget.deleteByCategory(req.userId, category);

    if (!deleted) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    return res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router;
