const express = require('express');       
require('dotenv').config();               

const userRoutes = require('./src/routes/userRoutes'); 
const configRoutes = require('./src/routes/configRoutes');

const connectDB = require('./src/config/database');
connectDB();

const app = express();                     
const PORT = process.env.PORT || 5000;    

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Root path status check
app.get('/', (req, res) => {               
  res.send('Parivar App Server is Running! 🚀');
});

// Mount Routes
app.use('/api/config', configRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {                  
  console.log(`http://localhost:${PORT}`);
});
