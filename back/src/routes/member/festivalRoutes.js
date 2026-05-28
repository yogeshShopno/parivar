const express = require('express');
const { getFestivals } = require('../../controllers/feedController');
const adminContent = require('../../controllers/adminContentController');
const { protect } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, getFestivals);
router.post('/', parseForm, adminContent.saveFestival);

module.exports = router;
