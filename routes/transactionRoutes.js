const express = require('express');
const TransactionController = require('../controllers/TransactionController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.get('/', verifyToken, TransactionController.getAll);
router.post('/', verifyToken, TransactionController.create);
router.delete('/:id', verifyToken, TransactionController.delete);

module.exports = router;
