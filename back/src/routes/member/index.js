const express = require('express');

const router = express.Router();

router.use(require('../authRoutes'));
router.use(require('../businessRoutes'));
router.use(require('../directoryRoutes'));
router.use(require('../PostsRoutes'));

router.use('/auth', require('../authRoutes'));
router.use('/business', require('../businessRoutes'));
router.use('/config', require('../configRoutes'));
router.use('/directory', require('../directoryRoutes'));
router.use('/posts', require('../PostsRoutes'));
router.use('/news', require('../newsRoutes'));
router.use('/users', require('./userRoutes'));

module.exports = router;
