import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/invoice_app';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Successfully connected to database at: ${uri}`);
  } catch (err) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB (${err.message}). Running in fallback mode.`);
  }
}
