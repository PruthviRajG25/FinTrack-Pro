const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now }
});

transactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    if (ret.user_id) ret.user_id = ret.user_id.toString();
  }
});

const TransactionModel = mongoose.model('Transaction', transactionSchema);

class Transaction {
  static async getByUserId(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    const txs = await TransactionModel.find({ user_id: userId }).sort({ date: -1 });
    return txs.map(tx => tx.toJSON());
  }

  static async create(userId, description, amount, type, category) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return null;
    const tx = await TransactionModel.create({
      user_id: userId,
      description,
      amount,
      type,
      category
    });
    return tx.toJSON();
  }

  static async delete(transactionId, userId) {
    if (!mongoose.Types.ObjectId.isValid(transactionId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }
    const result = await TransactionModel.deleteOne({ _id: transactionId, user_id: userId });
    return result.deletedCount > 0;
  }
}

module.exports = Transaction;
