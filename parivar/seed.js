const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/userModels');
const seedUsers = require('./seedData');

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is missing in .env');
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoURI);
    console.log('Connected to database 🍃');

    console.log('Clearing existing users...');
    await User.deleteMany();
    console.log('Existing users cleared.');

    console.log('Inserting seed users...');
    // Loop through users and create them one-by-one so Mongoose pre-save hooks (password hashing) trigger
    for (const user of seedUsers) {
      await User.create(user);
    }
    console.log(`Successfully seeded ${seedUsers.length} users! 🎉`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message} ❌`);
    process.exit(1);
  }
};

seedDB();
