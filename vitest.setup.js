/**
 * Vitest global setup — starts an in-memory MongoDB server before any tests run
 * and tears it down cleanly afterwards.
 *
 * This ensures tests never need a real MONGODB_URI and are fully self-contained
 * in any environment (local, CI, etc.).
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll } from 'vitest';

let mongod;

export async function setup() {
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
  }
}

export async function teardown() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});
