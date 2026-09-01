import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoices.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

export const app = express();
export const PORT = process.env.PORT || 5000;
export const HOST = '0.0.0.0';

// Permissive CORS for web requests & reverse proxies
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
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/invoices')) {
      return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
    next();
  }
});

// API Router
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ouvra Billing API',
    env: process.env.NODE_ENV || 'production',
    dbState: process.env.MONGODB_URI ? 'Connected' : 'Missing MONGODB_URI',
    time: new Date().toISOString()
  });
});

apiRouter.use('/auth', authRoutes);
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
