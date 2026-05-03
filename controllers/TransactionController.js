const Transaction = require('../models/Transaction');

class TransactionController {
  // Get all transactions for user
  static async getAll(req, res) {
    try {
      const transactions = await Transaction.getByUserId(req.userId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  // Create transaction
  static async create(req, res) {
    try {
      const { description, amount, type, category } = req.body;
      
      if (!description || !amount || !type || !category) {
        return res.status(400).json({ 
          error: 'Description, amount, type, and category are required' 
        });
      }
      
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Type must be income or expense' });
      }
      
      const transaction = await Transaction.create(
        req.userId,
        description,
        amount,
        type,
        category
      );
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  // Delete transaction
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await Transaction.delete(id, req.userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
}

module.exports = TransactionController;
