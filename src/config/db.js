import mongoose from 'mongoose';
import config from '@/config';

/**
 * Global cache to reuse the connection across hot-reloads in dev.
 * In production each serverless invocation gets a fresh module scope,
 * so the cache prevents opening too many connections.
 */
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB (singleton pattern).
 * Call this at the top of every route handler or service function.
 */
const dbConnect = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(config.database.url, config.database.options)
      .then((mongoose) => {
        console.log(` MongoDB Connected: ${mongoose.connection.host}`);
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
