const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async (mongoUrl) => {
  const connectionType = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
    try {
      await mongoose.connect(mongoUrl);
      console.log('MongoDB is connected to', connectionType, 'server\n');
    } catch (err) { 
      console.error(err.message);
      process.exit(1);
    }
};
  
  module.exports = connectToDatabase;