const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const user = await User.create(email, password, name);
      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'User already exists') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const user = await User.findByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await User.verifyPassword(user.password, password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error("❌ ERROR: JWT_SECRET environment variable is not defined!");
        return res.status(500).json({ error: 'JWT_SECRET environment variable is missing on the server. Please add it to your Vercel Environment Variables.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, secret, {
        expiresIn: '24h',
      });
      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const updated = await User.updateName(req.userId, name.trim());
      if (!updated) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'Profile updated', user: updated });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both current and new passwords are required' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      const user = await User.findByIdWithPassword(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const ok = await User.verifyPassword(user.password, currentPassword);
      if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
      await User.updatePassword(req.userId, newPassword);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
}

module.exports = AuthController;
