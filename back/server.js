const express = require('express');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const businessRoutes = require('./src/routes/businessRoutes');
const configRoutes = require('./src/routes/configRoutes');
const directoryRoutes = require('./src/routes/directoryRoutes');
const feedRoutes = require('./src/routes/feedRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const connectDB = require('./src/config/database');
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With, Accept, Origin');

  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  return next();
});
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/', (req, res) => {
  res.send('Parivar App Server is Running!');
});

app.post('/test', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'PARIVAR.APP API WORKING',
    data: []
  });
});

// Postman collection routes are root-level, so keep them mounted directly.
app.use('/', authRoutes);
app.use('/', businessRoutes);
app.use('/', directoryRoutes);
app.use('/', feedRoutes);

// Namespaced aliases for app/admin usage.
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/config', configRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Route not found',
    data: []
  });
});

app.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
      data: []
    });
  }

  return next();
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
