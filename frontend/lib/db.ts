import mongoose from 'mongoose';

type CachedMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: CachedMongoose | undefined;
}

const cached: CachedMongoose = global.mongooseCache ?? { conn: null, promise: null };

export async function dbConnect(): Promise<typeof mongoose> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI in environment variables.');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      dbName: 'rental_anything',
      autoIndex: true,
    });
  }

  cached.conn = await cached.promise;
  global.mongooseCache = cached;
  return cached.conn;
}
