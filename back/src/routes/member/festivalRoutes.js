const express = require('express');
const festivalController = require('../../controllers/festivalController');
const { protect } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', festivalController.getFestivals);
router.post('/', parseForm, festivalController.saveFestival);

module.exports = router;
