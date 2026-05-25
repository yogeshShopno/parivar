const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/login', require('./authRoutes'));
router.use('/stats', require('./dashboardRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/permissions', require('./roleRoutes'));
router.use('/roles', require('./roleRoutes'));
router.use('/businesses', require('./businessRoutes'));
router.use('/posts', require('./postRoutes'));
router.use('/config', require('./configRoutes'));
router.use('/get_app_theme', require('./configRoutes'));
router.use('/update_app_theme', require('./configRoutes'));
router.use('/admin/update_app_theme', require('./configRoutes'));
router.use('/content', require('./contentRoutes'));
router.use('/masters', require('./masterRoutes'));
router.use('/news', require('./newsRoutes'));

module.exports = router;
