const express = require('express');
const roleController = require('../../controllers/roleController');
const { protect, requirePermission } = require('../../middleware/auth');
const { createUser } = require('../../controllers/adminController');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Admin API is working!' }));

router.post('/register', parseForm, createUser);

router.use('/login', require('./authRoutes'));

router.use('/users', require('./userRoutes'));
router.use('/stats', require('./dashboardRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.get('/permissions', protect, requirePermission('roles.list'), roleController.getPermissionOptions);
router.use('/roles', require('./roleRoutes'));
router.use('/businesses', require('./businessRoutes'));
router.use('/business-categories', require('./businessCategoryRoutes'));
router.use('/students', require('./studentRoutes'));
router.use('/festivals', require('./festivalRoutes'));
router.use('/matrimonies', require('./matrimonyRoutes'));
router.use('/donations', require('./donationRoutes'));
router.use('/posts', require('./postRoutes'));
router.use('/get_app_theme', require('./configRoutes'));
router.use('/update_app_theme', require('./configRoutes'));
router.use('/content', require('./contentRoutes'));
router.use('/gallery', require('./galleryRoutes'));
router.use('/gallery-categories', require('./galleryCategoryRoutes'));
router.use('/masters', require('./masterRoutes'));
router.use('/news', require('./newsRoutes'));
router.use('/events', require('./eventRoutes'));
router.use('/feedback', require('../feedbackRoutes'));
router.use('/job-vacancy', require('../jobVacancyRoutes'));


// Approved member/mobile data exposed to admin software under the same admin base URL.
router.use(require('../member'));

module.exports = router;
