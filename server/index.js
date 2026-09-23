import { app, PORT, HOST } from './app.js';

// Environment validation on boot
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.warn('[Security Warning] JWT_SECRET is not set in production environment.');
  }
  if (!process.env.MONGODB_URI) {
    console.error('[Configuration Error] MONGODB_URI is required in production.');
  }
}

app.listen(PORT, HOST, () => {
  console.log(`[Server] Ouvra Billing API running on http://${HOST}:${PORT} (ENV: ${process.env.NODE_ENV || 'development'})`);
});
