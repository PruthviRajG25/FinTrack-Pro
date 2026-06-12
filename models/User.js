const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  monthly_budget: { type: Number, default: null },
  created_at: { type: Date, default: Date.now }
});

// Map _id to id when returning JSON
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

const UserModel = mongoose.model('User', userSchema);

class User {
  static async findByEmail(email) {
    if (!email) return null;
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user ? user.toJSON() : null;
  }

  static async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await UserModel.findById(id).select('-password');
    return user ? user.toJSON() : null;
  }

  static async findByIdWithPassword(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await UserModel.findById(id);
    return user ? user.toJSON() : null;
  }

  static async create(email, password, name) {
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }
    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
    });
    return user.toJSON();
  }

  static async updateName(id, name) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await UserModel.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    ).select('-password');
    return user ? user.toJSON() : null;
  }

  static async updatePassword(id, newPassword) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await UserModel.findByIdAndUpdate(id, { password: hashedPassword });
    return !!result;
  }

  static async verifyPassword(hashedPassword, plainPassword) {
    if (!hashedPassword || !plainPassword) return false;
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
