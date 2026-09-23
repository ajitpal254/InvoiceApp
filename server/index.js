import { app, PORT, HOST } from './app.js';
import { connectDB } from './config/db.js';

// Environment validation on boot
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.warn('[Security Warning] JWT_SECRET is not set in production environment.');
  }
  if (!process.env.MONGODB_URI) {
    console.error('[Configuration Error] MONGODB_URI is required in production.');
    process.exit(1);
  }
}

const start = async () => {
  await connectDB();
  app.listen(PORT, HOST, () => {
    console.log(`[Server] nova-invoice API running on http://${HOST}:${PORT}`);
  });
};
start();
