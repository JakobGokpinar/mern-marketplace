const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async (mongoUrl) => {
  const dbName = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
    try {
      mongoose.connect(
        mongoUrl,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );

      console.log('MongoDB is connected to', dbName, 'server\n');
    } catch (err) { 
      console.error(err.message);
      process.exit(1);
    }
  };
  
  module.exports = connectToDatabase;