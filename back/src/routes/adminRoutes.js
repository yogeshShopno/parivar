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
const adminContent = require('../controllers/adminContentController');

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

// Admin content management endpoints
router.get('/festivals', protect, adminContent.getFestivals);
router.post('/festivals', protect, parseForm, adminContent.saveFestival);
router.put('/festivals/:id', protect, parseForm, adminContent.saveFestival);
router.delete('/festivals/:id', protect, adminContent.deleteFestival);

router.get('/events', protect, adminContent.getEvents);
router.post('/events', protect, parseForm, adminContent.saveEvent);
router.put('/events/:id', protect, parseForm, adminContent.saveEvent);
router.delete('/events/:id', protect, adminContent.deleteEvent);

router.get('/gallery', protect, adminContent.getGallery);
router.post('/gallery', protect, parseForm, adminContent.saveGallery);
router.put('/gallery/:id', protect, parseForm, adminContent.saveGallery);
router.delete('/gallery/:id', protect, adminContent.deleteGallery);

router.get('/banners', protect, adminContent.getBanners);
router.post('/banners', protect, parseForm, adminContent.saveBanner);
router.put('/banners/:id', protect, parseForm, adminContent.saveBanner);
router.delete('/banners/:id', protect, adminContent.deleteBanner);

router.get('/contact-inquiries', protect, adminContent.getInquiries);
router.post('/contact-inquiries', protect, parseForm, adminContent.saveInquiry);
router.put('/contact-inquiries/:id', protect, parseForm, adminContent.saveInquiry);
router.delete('/contact-inquiries/:id', protect, adminContent.deleteInquiry);

router.get('/masters/:type', protect, adminContent.getMasters);
router.post('/masters/:type', protect, parseForm, adminContent.saveMaster);
router.put('/masters/:type/:id', protect, parseForm, adminContent.saveMaster);
router.delete('/masters/:type/:id', protect, adminContent.deleteMaster);

module.exports = router;
