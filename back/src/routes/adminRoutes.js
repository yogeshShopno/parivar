const express = require('express');
const { protect, requirePermission } = require('../middleware/auth');
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
const roleController = require('../controllers/roleController');

const router = express.Router();

// Auth endpoint
router.post('/login', parseForm, login);

// Dashboard statistics
router.get('/stats', protect, requirePermission('dashboard.view'), getStats);

// Users CRUD endpoints
router.get('/users', protect, requirePermission('users.manage'), getUsers);
router.post('/users', protect, requirePermission('users.manage'), parseForm, createUser);
router.put('/users/:id', protect, requirePermission('users.manage'), parseForm, updateUser);
router.delete('/users/:id', protect, requirePermission('users.manage'), deleteUser);

// Roles & permissions endpoints
router.get('/permissions', protect, requirePermission('roles.manage'), roleController.getPermissionOptions);
router.get('/roles', protect, requirePermission('roles.manage'), roleController.getRoles);
router.post('/roles', protect, requirePermission('roles.manage'), parseForm, roleController.saveRole);
router.put('/roles/:id', protect, requirePermission('roles.manage'), parseForm, roleController.saveRole);
router.delete('/roles/:id', protect, requirePermission('roles.manage'), roleController.deleteRole);

// Businesses endpoints
router.get('/businesses', protect, requirePermission('businesses.manage'), getBusinesses);
router.put('/businesses/:id', protect, requirePermission('businesses.manage'), parseForm, updateBusiness);
router.delete('/businesses/:id', protect, requirePermission('businesses.manage'), deleteBusiness);

// Feed Posts endpoints
router.get('/posts', protect, requirePermission('posts.manage'), getPosts);
router.delete('/posts/:id', protect, requirePermission('posts.manage'), deletePost);

// Platform Configuration endpoints
router.get('/config', protect, requirePermission('settings.manage'), getConfig);
router.put('/config', protect, requirePermission('settings.manage'), parseForm, updateConfig);

// Admin content management endpoints
router.get('/festivals', protect, requirePermission('festivals.manage'), adminContent.getFestivals);
router.post('/festivals', protect, requirePermission('festivals.manage'), parseForm, adminContent.saveFestival);
router.put('/festivals/:id', protect, requirePermission('festivals.manage'), parseForm, adminContent.saveFestival);
router.delete('/festivals/:id', protect, requirePermission('festivals.manage'), adminContent.deleteFestival);

router.get('/events', protect, requirePermission('events.manage'), adminContent.getEvents);
router.post('/events', protect, requirePermission('events.manage'), parseForm, adminContent.saveEvent);
router.put('/events/:id', protect, requirePermission('events.manage'), parseForm, adminContent.saveEvent);
router.delete('/events/:id', protect, requirePermission('events.manage'), adminContent.deleteEvent);

router.get('/gallery', protect, requirePermission('gallery.manage'), adminContent.getGallery);
router.post('/gallery', protect, requirePermission('gallery.manage'), parseForm, adminContent.saveGallery);
router.put('/gallery/:id', protect, requirePermission('gallery.manage'), parseForm, adminContent.saveGallery);
router.delete('/gallery/:id', protect, requirePermission('gallery.manage'), adminContent.deleteGallery);

router.get('/banners', protect, requirePermission('banners.manage'), adminContent.getBanners);
router.post('/banners', protect, requirePermission('banners.manage'), parseForm, adminContent.saveBanner);
router.put('/banners/:id', protect, requirePermission('banners.manage'), parseForm, adminContent.saveBanner);
router.delete('/banners/:id', protect, requirePermission('banners.manage'), adminContent.deleteBanner);

router.get('/contact-inquiries', protect, requirePermission('contact-inquiries.manage'), adminContent.getInquiries);
router.post('/contact-inquiries', protect, requirePermission('contact-inquiries.manage'), parseForm, adminContent.saveInquiry);
router.put('/contact-inquiries/:id', protect, requirePermission('contact-inquiries.manage'), parseForm, adminContent.saveInquiry);
router.delete('/contact-inquiries/:id', protect, requirePermission('contact-inquiries.manage'), adminContent.deleteInquiry);

router.get('/masters/:type', protect, requirePermission('masters.manage'), adminContent.getMasters);
router.post('/masters/:type', protect, requirePermission('masters.manage'), parseForm, adminContent.saveMaster);
router.put('/masters/:type/:id', protect, requirePermission('masters.manage'), parseForm, adminContent.saveMaster);
router.delete('/masters/:type/:id', protect, requirePermission('masters.manage'), adminContent.deleteMaster);

module.exports = router;
