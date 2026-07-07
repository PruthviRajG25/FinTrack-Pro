const mongoose = require('mongoose');
require('dotenv').config();

const resolveMongoUri = () => {
  return process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || process.env.MONGO_URL || null;
};

const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/FinTrack_db';

let cachedConnectionPromise = null;

const connectDB = async () => {
  // If already connected, return the connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection attempt is in progress, return the cached promise
  if (cachedConnectionPromise) {
    return cachedConnectionPromise;
  }

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
  const configuredUri = resolveMongoUri();
  const candidates = [];

  if (!isProduction) {
    candidates.push(LOCAL_FALLBACK_URI);
  }

  if (configuredUri) {
    candidates.push(configuredUri);
  }

  if (candidates.length === 0) {
    if (isProduction) {
      console.warn('⚠️ MongoDB is unavailable; continuing without a database connection for this serverless cold start.');
    }
    return null;
  }

  // Define the connection promise
  cachedConnectionPromise = (async () => {
    // Try to connect to candidates in reverse order (configuredUri first)
    for (let i = candidates.length - 1; i >= 0; i--) {
      const candidate = candidates[i];
      try {
        await mongoose.connect(candidate, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ MongoDB Connected Successfully');
        return mongoose.connection;
      } catch (err) {
        const message = err?.message || String(err);
        if (!isProduction || candidate === configuredUri) {
          console.warn(`⚠️ MongoDB connection unavailable for ${candidate}: ${message}`);
        }
      }
    }

    // If all candidates fail
    cachedConnectionPromise = null; // Clear cache on failure so we can try again next request
    if (isProduction) {
      console.warn('⚠️ MongoDB is unavailable; continuing without a database connection.');
    }
    return null;
  })();

  return cachedConnectionPromise;
};

module.exports = {
  connectDB,
  initSchema: connectDB
};

