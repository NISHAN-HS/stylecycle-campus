const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    // Check if MongoDB URI exists
    if (!mongoUri) {
      throw new Error(
        'MONGODB_URI is missing. Please check your server/.env file.'
      );
    }

    // Hide database password in terminal logs
    const maskedUri = mongoUri.replace(
      /(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/,
      '$1*****$3'
    );

    console.log(`[DB] Connecting to MongoDB: ${maskedUri}`);

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000
    });

    console.log(
      `[DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );

    return conn;

  } catch (error) {
    console.error(
      `[DB ERROR] Failed to connect to MongoDB: ${error.message}`
    );

    process.exit(1);
  }
};

module.exports = connectDB;