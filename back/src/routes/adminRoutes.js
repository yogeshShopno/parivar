const express = require('express');
const { protect } = require('../middleware/auth');
const { parseForm } = require('../middleware/upload');
const {
  login,
  getStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getBusinesses,
  updateBusiness,
  deleteBusiness,
  getPosts,
  deletePost,
  getConfig,
  updateConfig
} = require('../controllers/adminController');

const router = express.Router();

// Auth endpoint
router.post('/login', parseForm, login);

// Dashboard statistics
router.get('/stats', protect, getStats);

// Users CRUD endpoints
router.get('/users', protect, getUsers);
router.post('/users', protect, parseForm, createUser);
router.put('/users/:id', protect, parseForm, updateUser);
router.delete('/users/:id', protect, deleteUser);

// Businesses endpoints
router.get('/businesses', protect, getBusinesses);
router.put('/businesses/:id', protect, parseForm, updateBusiness);
router.delete('/businesses/:id', protect, deleteBusiness);

// Feed Posts endpoints
router.get('/posts', protect, getPosts);
router.delete('/posts/:id', protect, deletePost);

// Platform Configuration endpoints
router.get('/config', protect, getConfig);
router.put('/config', protect, parseForm, updateConfig);

module.exports = router;
