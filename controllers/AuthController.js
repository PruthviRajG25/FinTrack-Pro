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

      const secret = process.env.JWT_SECRET || process.env.jwt_secret;
      if (!secret) {
        console.error('❌ ERROR: JWT_SECRET environment variable is not defined!');
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

  static async getConfig(req, res) {
    res.json({
      githubClientId: process.env.GITHUB_CLIENT_ID || null
    });
  }

  static async githubLogin(req, res) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'GitHub authorization code is required' });
      }

      const client_id = process.env.GITHUB_CLIENT_ID;
      const client_secret = process.env.GITHUB_CLIENT_SECRET;

      if (!client_id || !client_secret) {
        console.error('❌ ERROR: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET environment variable is not defined!');
        return res.status(500).json({ error: 'GitHub OAuth is not configured on the server. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your .env file.' });
      }

      // 1. Exchange the code for a GitHub access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id,
          client_secret,
          code
        })
      });

      const tokenData = await tokenResponse.json();
      if (tokenData.error) {
        console.error('Error exchanging GitHub code:', tokenData);
        return res.status(400).json({ error: tokenData.error_description || 'Failed to exchange GitHub authorization code' });
      }

      const accessToken = tokenData.access_token;
      if (!accessToken) {
        return res.status(400).json({ error: 'GitHub access token not received' });
      }

      // 2. Fetch the user profile from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'FinTrack-Pro-App'
        }
      });

      if (!userResponse.ok) {
        return res.status(400).json({ error: 'Failed to fetch user profile from GitHub' });
      }

      const userProfile = await userResponse.json();
      const githubId = String(userProfile.id);
      const name = userProfile.name || userProfile.login;

      // 3. Fetch user emails
      let email = userProfile.email;
      if (!email) {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'FinTrack-Pro-App'
          }
        });
        
        if (emailsResponse.ok) {
          const emails = await emailsResponse.json();
          const primaryEmailObj = emails.find(e => e.primary && e.verified) || emails[0];
          if (primaryEmailObj) {
            email = primaryEmailObj.email;
          }
        }
      }

      if (!email) {
        return res.status(400).json({ error: 'Email not provided or accessible on your GitHub account. Please make your email public or verify it on GitHub.' });
      }

      // 4. Find or create the user in our database
      const user = await User.findOrCreateGithubUser(email, name, githubId);

      const secret = process.env.JWT_SECRET || process.env.jwt_secret;
      if (!secret) {
        console.error('❌ ERROR: JWT_SECRET environment variable is not defined!');
        return res.status(500).json({ error: 'JWT_SECRET environment variable is missing on the server.' });
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
      console.error('GitHub login error:', error);
      res.status(500).json({ error: 'GitHub login failed' });
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
