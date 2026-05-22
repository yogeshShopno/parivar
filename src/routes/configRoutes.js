const express = require('express');
const { getConfig, updateConfig } = require('../controllers/configController');

const router = express.Router();

router.get('/', getConfig);
router.post('/', updateConfig);
router.put('/', updateConfig);

module.exports = router;
