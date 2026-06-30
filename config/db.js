const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

  if (!uri) {
    if (isProduction) {
      console.error("❌ ERROR: MONGODB_URI environment variable is missing on Vercel/Production!");
      console.error("Please configure MONGODB_URI in your Vercel Project Settings (Environment Variables) with your MongoDB connection string.");
      throw new Error("MONGODB_URI environment variable is missing in production");
    } else {
      uri = 'mongodb://127.0.0.1:27017/FinTrack_db';
      console.log(`ℹ️ MONGODB_URI not set. Falling back to local MongoDB: ${uri}`);
    }
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Failure:", err.message);
    throw err;
  }
};

module.exports = {
  connectDB,
  initSchema: connectDB
};

