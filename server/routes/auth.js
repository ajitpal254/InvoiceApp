import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { authMiddleware, getJwtSecret } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';

const router = express.Router();

// Strict rate limiter for authentication endpoints to protect against brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' }
});

// Register
router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { username, email, password, fullName, companyName, address, taxId, country } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
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
    next(err);
  }
});

// Login
router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username.trim().toLowerCase();

    const user = await User.findOne({ 
      $or: [{ username: cleanUsername }, { email: cleanUsername }] 
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, email: user.email },
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
    next(err);
  }
});

// Profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

// Verification handler
router.get('/verify', async (req, res, next) => {
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
    next(err);
  }
});

export default router;
