/**
 * Vitest global setup — starts an in-memory MongoDB server before any tests run
 * and tears it down cleanly afterwards.
 *
 * This ensures tests never need a real MONGODB_URI and are fully self-contained
 * in any environment (local, CI, etc.).
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

export async function setup() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  });
}

export async function teardown() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
