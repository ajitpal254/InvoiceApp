import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { sanitizeMongoInput } from './middleware/mongoSanitize.js';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoices.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

export const app = express();
export const PORT = process.env.PORT || 5000;
export const HOST = '0.0.0.0';

// Apply Helmet for security HTTP response headers
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible asset loading for SPA frontend
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
    if (!origin) return callback(null, true);
    
    // In development mode or if wildcard configured explicitly
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error(`CORS origin '${origin}' not allowed.`));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize MongoDB operators against NoSQL injection
app.use(sanitizeMongoInput);

// API Router
const apiRouter = express.Router();

// Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests, please try again later.' }
});

// Health check that actively verifies MongoDB connectivity
apiRouter.get('/health', async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const healthData = {
    status: isDbConnected ? 'ok' : 'degraded',
    service: 'nova-invoice API',
    env: process.env.NODE_ENV || 'development',
    database: {
      connected: isDbConnected,
      state: isDbConnected ? 'Connected' : 'Disconnected'
    },
    timestamp: new Date().toISOString()
  };

  if (!isDbConnected && process.env.MONGODB_URI) {
    return res.status(503).json(healthData);
  }

  return res.status(200).json(healthData);
});

apiRouter.use('/auth', authLimiter, authRoutes);
apiRouter.use('/invoices', invoiceRoutes);

// Mount API router under both /api and root /
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);

// Serve built frontend assets from dist/ (Render Web Service)
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Single Page Application (SPA) fallback middleware
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/.netlify')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// 404 handler for unknown API calls
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found', path: req.path });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err);

  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    message: isProduction && statusCode === 500 ? 'Internal server error' : (err.message || 'An error occurred'),
    ...(isProduction ? {} : { stack: err.stack })
  });
});
