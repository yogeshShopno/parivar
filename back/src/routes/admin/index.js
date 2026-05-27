const express = require('express');
const roleController = require('../../controllers/roleController');
const { protect, requirePermission } = require('../../middleware/auth');
const { createUser } = require('../../controllers/adminController');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.post('/register', parseForm, createUser);

router.use('/login', require('./authRoutes'));

router.use('/users', require('./userRoutes'));
router.use('/stats', require('./dashboardRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.get('/permissions', protect, requirePermission('roles.list'), roleController.getPermissionOptions);
router.use('/roles', require('./roleRoutes'));
router.use('/businesses', require('./businessRoutes'));
router.use('/posts', require('./postRoutes'));
router.use('/config', require('./configRoutes'));
router.use('/get_app_theme', require('./configRoutes'));
router.use('/update_app_theme', require('./configRoutes'));
router.use('/content', require('./contentRoutes'));
router.use('./gallery', require('./galleryRoutes')); // Gallery routes are now under /content, but this line is kept for backward compatibility.
router.use('/masters', require('./masterRoutes'));
router.use('/news', require('./newsRoutes'));

// Approved member/mobile data exposed to admin software under the same admin base URL.
router.use(require('../member'));

module.exports = router;
