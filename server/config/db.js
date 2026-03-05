const mongoose = require('mongoose');
const logger = require('./logger');
require('dotenv').config();

const connectToDatabase = async (mongoUrl) => {
  const connectionType = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
    try {
      await mongoose.connect(mongoUrl);
      logger.info(`MongoDB connected to ${connectionType} server`);
    } catch (err) {
      logger.fatal(err, 'MongoDB connection failed');
      process.exit(1);
    }
};
  
  module.exports = connectToDatabase;