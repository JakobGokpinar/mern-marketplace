const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async (mongoUrl) => {
  const dbName = process.env.NODE_ENV === 'development' ? 'rego-dev' : 'rego-prod';
    try {
      mongoose.connect(
        `${mongoUrl}/${dbName}`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );

      console.log('Mongo is connected to ', dbName, " env\n");
    } catch (err) { 
      console.error(err.message);
      process.exit(1);
    }
  };
  
  module.exports = connectToDatabase;