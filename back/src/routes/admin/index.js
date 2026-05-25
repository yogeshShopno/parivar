const express = require('express');
const roleController = require('../../controllers/roleController');
const { protect, requirePermission } = require('../../middleware/auth');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/login', require('./authRoutes'));
router.use('/stats', require('./dashboardRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/users', require('./userRoutes'));
router.get('/permissions', protect, requirePermission('roles.list'), roleController.getPermissionOptions);
router.use('/roles', require('./roleRoutes'));
router.use('/businesses', require('./businessRoutes'));
router.use('/posts', require('./postRoutes'));
router.use('/config', require('./configRoutes'));
router.use('/get_app_theme', require('./configRoutes'));
router.use('/update_app_theme', require('./configRoutes'));
router.use('/content', require('./contentRoutes'));
router.use('/masters', require('./masterRoutes'));
router.use('/news', require('./newsRoutes'));

// Approved member/mobile data exposed to admin software under the same admin base URL.
router.use(require('../member'));

module.exports = router;
