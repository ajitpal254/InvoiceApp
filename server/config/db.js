import mongoose from 'mongoose';

let cachedPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI environment variable is missing.');
    return;
  }

  if (!cachedPromise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };
    cachedPromise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected to database: ${mongooseInstance.connection.name}`);
      return mongooseInstance;
    }).catch(err => {
      cachedPromise = null;
      console.error('[MongoDB] Connection error:', err.message);
      throw err;
    });
  }

  return await cachedPromise;
}
