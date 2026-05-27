const express = require('express');
const {
  getConfig,
  updateConfig
} = require('../../controllers/adminController');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('settings.edit'), getConfig);

router.put('/', protect, requirePermission('settings.edit'), parseForm, updateConfig);

module.exports = router;
