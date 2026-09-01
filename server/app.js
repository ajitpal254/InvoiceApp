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
export const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

// Connect to MongoDB with connection pooling middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error('DB connect middleware error', e);
  }
  next();
});

// Permissive CORS for Netlify / local
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Router
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/invoices', invoiceRoutes);
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ouvra Billing API',
    runtime: process.env.NETLIFY ? 'Netlify Functions' : 'Node Express',
    time: new Date().toISOString()
  });
});

// Mount router on both /api and /.netlify/functions/api for Netlify compatibility
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);
app.use(apiRouter); // fallback for direct invocation

// Serve static frontend in full Node mode (e.g. Docker / local / VPS)
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/.netlify')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}
