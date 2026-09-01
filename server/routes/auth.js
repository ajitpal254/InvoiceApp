import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authMiddleware, getJwtSecret } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, companyName, address, taxId, country } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      passwordHash,
      fullName: fullName || '',
      companyName: companyName || '',
      address: address || '',
      taxId: taxId || '',
      country: country || '',
      isVerified: true
    });

    await user.save();
    return res.status(201).json({ message: 'User registered successfully', username: user.username });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ 
      $or: [{ username: username.trim() }, { email: username.trim().toLowerCase() }] 
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      getJwtSecret(),
      { algorithm: 'HS256', expiresIn: '7d' }
    );

    return res.json({
      token,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

// Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Verification handler
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token required' });

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid verification token' });

    user.isVerified = true;
    user.verificationToken = '';
    await user.save();

    return res.json({ message: 'Email successfully verified!' });
  } catch (err) {
    return res.status(500).json({ message: 'Verification error' });
  }
});

// List all users (admin / overview)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// Full database summary
router.get('/database-summary', async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    const collections = await User.db.db.listCollections().toArray();
    const summary = {
      databaseName: User.db.name,
      collections: collections.map(c => c.name),
      totalUsers: users.length,
      users: users
    };
    return res.json(summary);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch database summary', error: err.message });
  }
});

export default router;
