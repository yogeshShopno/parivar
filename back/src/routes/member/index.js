const express = require('express');

const router = express.Router();

router.use(require('../authRoutes'));

router.use(require('../directoryRoutes'));
router.use(require('../postRoutes'));
router.use(require('../newsRoutes'));
router.use(require('../newsRoutes'));




router.use('/auth', require('../authRoutes'));
router.use('/get_app_theme', require('../configRoutes'));
router.use('/update_app_theme', require('../configRoutes'));
router.use('/directory', require('../directoryRoutes'));
router.use('/posts', require('../postRoutes'));
router.use('/news', require('../newsRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/gallery', require('../galleryRoutes'));
router.use('/gallery-categories', require('../galleryCategoryRoutes'));
router.use('/students', require('./studentRoutes'));
router.use('/matrimonies', require('./matrimonyRoutes'));
router.use('/festivals', require('./festivalRoutes'));
router.use('/donations', require('./donationRoutes'));
router.use('/events', require('../eventRoutes'));
router.use('/businesses', require('../businessRoutes'))
router.use('/feedback', require('../feedbackRoutes'));




module.exports = router;
