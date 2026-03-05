import mongoose from 'mongoose';
import logger from './logger';
import 'dotenv/config';

const connectToDatabase = async (mongoUrl: string) => {
  const connectionType = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
  try {
    await mongoose.connect(mongoUrl);
    logger.info(`MongoDB connected to ${connectionType} server`);
  } catch (err) {
    logger.fatal(err, 'MongoDB connection failed');
    process.exit(1);
  }
};

export default connectToDatabase;
