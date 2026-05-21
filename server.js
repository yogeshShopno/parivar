const express = require('express');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const businessRoutes = require('./src/routes/businessRoutes');
const configRoutes = require('./src/routes/configRoutes');
const directoryRoutes = require('./src/routes/directoryRoutes');
const feedRoutes = require('./src/routes/feedRoutes');
const userRoutes = require('./src/routes/userRoutes');

const connectDB = require('./src/config/database');
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/', (req, res) => {
  res.send('Parivar App Server is Running!');
});

app.post('/test', (req, res) => {
  res.status(200).json({ message: 'Parivar API is working' });
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

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return next();
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
