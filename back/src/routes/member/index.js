const express = require('express');

const router = express.Router();

router.use(require('../authRoutes'));
router.use(require('../businessRoutes'));
router.use(require('../directoryRoutes'));
router.use(require('../postsRoutes'));

router.use('/auth', require('../authRoutes'));
router.use('/business', require('../businessRoutes'));
router.use('/config', require('../configRoutes'));
router.use('/directory', require('../directoryRoutes'));
router.use('/posts', require('../postsRoutes'));
router.use('/news', require('../newsRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/gallery', require('../galleryRoutes'));
router.use('/gallery-categories', require('../galleryCategoryRoutes'));


module.exports = router;
