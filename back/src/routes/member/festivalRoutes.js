const express = require('express');
const { getFestivals } = require('../../controllers/feedController');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.get('/', protect, getFestivals);

module.exports = router;
