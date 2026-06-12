const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true, trim: true },
  limit_amount: { type: Number, required: true }
});

budgetSchema.index({ user_id: 1, category: 1 }, { unique: true });

budgetSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    if (ret.user_id) ret.user_id = ret.user_id.toString();
  }
});

const BudgetModel = mongoose.model('Budget', budgetSchema);

const Budget = {
  updateLimit: async (userId, category, limitAmount) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) return null;
    const budget = await BudgetModel.findOneAndUpdate(
      { user_id: userId, category },
      { limit_amount: limitAmount },
      { upsert: true, new: true }
    );
    return budget.toJSON();
  },

  getLimits: async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    const budgets = await BudgetModel.find({ user_id: userId }).sort({ category: 1 });
    return budgets.map(b => b.toJSON());
  },

  deleteByCategory: async (userId, category) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) return false;
    const result = await BudgetModel.deleteOne({ user_id: userId, category });
    return result.deletedCount > 0;
  }
};

module.exports = Budget;
