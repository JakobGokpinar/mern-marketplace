const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async (mongoUrl) => {
  var connectionType = process.env.NODE_ENV == "production" ? "production" : "development";
    try {
      mongoose.connect(
        mongoUrl,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );

      console.log('MongoDB is connected to', connectionType, "server \n");
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  };
  
  module.exports = connectToDatabase;