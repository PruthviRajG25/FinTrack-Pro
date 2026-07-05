const mongoose = require('mongoose');
require('dotenv').config();

const resolveMongoUri = () => {
  return process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || process.env.MONGO_URL || null;
};

const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/FinTrack_db';

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
  const configuredUri = resolveMongoUri();
  const candidates = [];

  if (!isProduction) {
    candidates.push(LOCAL_FALLBACK_URI);
  }

  if (configuredUri) {
    candidates.push(configuredUri);
  }

  for (const candidate of candidates) {
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

  if (isProduction) {
    console.warn('⚠️ MongoDB is unavailable; continuing without a database connection for this serverless cold start.');
  }

  return null;
};

module.exports = {
  connectDB,
  initSchema: connectDB
};

