const mongoose = require('mongoose');
const queryHelper = require('./src/utils/queryHelper');
const User = require('./src/models/userModels');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parivar').then(async () => {
  await User.deleteMany({});
  for(let i=0; i<15; i++) {
    await User.create({ first_name: `User${i}`, member_id: `${i}`, number: '123' });
  }

  const req = { query: { page: '1', limit: '10' }, body: {} };
  const { data: users, pagination } = await queryHelper(User, req.query, {
    baseQuery: {},
    searchFields: ['first_name'],
    filterFields: ['is_committee'],
    select: '-password',
    defaultSort: { createdAt: -1 },
    lean: false
  });
  console.log("Pagination:", pagination);
  console.log("Users count:", users.length);
  process.exit();
}).catch(console.error);
