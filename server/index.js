import { app, PORT, HOST } from './app.js';

app.listen(PORT, HOST, () => {
  console.log(`[Server] Ouvra Billing API running on http://${HOST}:${PORT} (ENV: ${process.env.NODE_ENV || 'development'})`);
});
