import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import User from './models/User.js';
import Invoice from './models/Invoice.js';

dotenv.config();

dotenv.config();

// SMTP Transporter (Brevo)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_KEY || process.env.SMTP_PASS,
  },
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5000'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// Verification Email Function
async function sendVerificationEmail(email, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${frontendUrl}/verify?token=${token}`;
  
  const mailOptions = {
    to: email,
    from: `"Ouvra Billing" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`, 
    subject: 'Verify your Ouvra Billing Account',
    text: `Hello! Please verify your account by clicking this link: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #10b981;">Welcome to Ouvra Billing</h2>
        <p>You're almost there! Click the button below to verify your email and start saving your invoices to the cloud.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 16px;">Verify Email</a>
        <p style="margin-top: 24px; font-size: 12px; color: #64748b;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    if (process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
      console.log('≡ƒôº Real email sent via Brevo SMTP to:', email);
    } else {
      console.log('-----------------------------------------');
      console.log('≡ƒôº (MOCK) SMTP CONFIG MISSING. LOGGING LINK:');
      console.log('≡ƒöù VERIFICATION LINK:', verifyUrl);
      console.log('-----------------------------------------');
    }
  } catch (error) {
    console.error('Γ¥î SMTP Error:', error.message);
  }
}

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Γ£à Connected to MongoDB Atlas'))
  .catch(err => console.error('Γ¥î MongoDB Connection Error:', err));

// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName, companyName, address, taxId, country } = req.body;
    
    // Check duplicates
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(400).json({ message: 'Username or Email already exists' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({ 
      username, email, password, fullName, companyName, address, taxId, country, verificationToken 
    });
    
    await user.save();

    // Send Verification Email
    await sendVerificationEmail(email, verificationToken);
    
    res.status(201).json({ message: 'Registration successful! Please check your email for the verification link.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ 
      id: user._id, 
      username: user.username,
      isVerified: user.isVerified 
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, username: user.username, isVerified: user.isVerified });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.json({ message: 'Email verified successfully! You can now save invoices to the cloud.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Invoice Routes ---

app.get('/api/invoices', authenticate, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/invoices', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email to save invoices to the cloud.' });
    }

    const invoiceData = { ...req.body, userId: req.user.id };
    const invoice = new Invoice(invoiceData);
    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/invoices/:id', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`≡ƒÜÇ Server running on http://localhost:${PORT}`);
});
