const express = require('express');
const { getConfig, updateConfig } = require('../controllers/configController');
const { parseForm } = require('../middleware/upload');

const router = express.Router();

router.get('/', getConfig);
router.post('/', parseForm, updateConfig);
router.put('/', parseForm, updateConfig);

module.exports = router;
