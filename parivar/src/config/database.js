const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is missing in .env');
    }
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host} 🍃`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message} ❌`);
    process.exit(1);
  }
};

module.exports = connectDB;
