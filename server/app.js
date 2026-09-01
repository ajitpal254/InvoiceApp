import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoices.js';

dotenv.config();

export const app = express();
export const PORT = process.env.PORT || 5000;
export const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

// Permissive CORS for Netlify / local
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection middleware with error logging
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// URL Normalizer: handles Netlify Function redirects (/api/..., /.netlify/functions/api/..., etc.)
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '') || '/';
  }
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace('/api', '') || '/';
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ouvra Billing API',
    runtime: process.env.NETLIFY ? 'Netlify Functions' : 'Node Express',
    dbState: process.env.MONGODB_URI ? 'Configured' : 'Missing MONGODB_URI',
    time: new Date().toISOString()
  });
});

// Mount Routes
app.use('/auth', authRoutes);
app.use('/invoices', invoiceRoutes);

// Fallback 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path, originalUrl: req.originalUrl });
});
