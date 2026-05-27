const express = require('express');

const router = express.Router();

router.use(require('../authRoutes'));
router.use(require('../businessRoutes'));
router.use(require('../directoryRoutes'));
router.use(require('../postRoutes'));

router.use('/auth', require('../authRoutes'));
router.use('/business', require('../businessRoutes'));
router.use('/get_app_theme', require('../configRoutes'));
router.use('/update_app_theme', require('../configRoutes'));
router.use('/directory', require('../directoryRoutes'));
router.use('/posts', require('../postRoutes'));
router.use('/news', require('../newsRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/gallery', require('../galleryRoutes'));
router.use('/gallery-categories', require('../galleryCategoryRoutes'));


module.exports = router;
