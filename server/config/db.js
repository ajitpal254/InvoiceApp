import mongoose from 'mongoose';

let cachedConnection = null;

export async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI is not set.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    cachedConnection = conn;
    console.log(`[MongoDB] Connected to database: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message);
  }
}
