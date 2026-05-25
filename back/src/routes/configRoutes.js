const express = require('express');
const { getConfig, updateConfig } = require('../controllers/configController');
const { protect } = require('../middleware/auth');
const { parseForm } = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, getConfig);
router.post('/', protect, parseForm, updateConfig);
router.put('/', protect, parseForm, updateConfig);

module.exports = router;
