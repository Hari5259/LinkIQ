const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB Atlas.
 * Retries on failure and logs connection status.
 */
const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('username:password') || uri.includes('cluster.mongodb.net')) {
      uri = 'mongodb://127.0.0.1:27017/linkiq';
      logger.warn(`No valid MONGODB_URI specified. Falling back to local: ${uri}`);
    }
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });

    logger.success(`MongoDB Connected: ${conn.connection.host}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed (app termination)');
      process.exit(0);
    });

    global.useMemoryEmulation = false;
    return conn;
  } catch (error) {
    logger.warn('MongoDB connection failed. Starting in local in-memory data emulation mode.', { error: error.message });
    global.useMemoryEmulation = true;
    return null;
  }
};

module.exports = connectDB;
