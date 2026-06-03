const mongoose = require('mongoose');
const { getUsers } = require('./src/controllers/userController');
const User = require('./src/models/userModels');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parivar').then(async () => {
  // ensure we have 15 users
  await User.deleteMany({});
  for(let i=0; i<15; i++) {
    await User.create({ first_name: `User${i}`, member_id: `${i}`, number: '123' });
  }

  const req = {
    query: { page: '2', limit: '10' },
    body: {}
  };
  
  const res = {
    status: (s) => ({
      json: (data) => {
        console.log("Status:", s);
        console.log("Response:", JSON.stringify(data, null, 2));
      }
    })
  };

  await getUsers(req, res);
  process.exit();
}).catch(console.error);
