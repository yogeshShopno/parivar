const express = require('express');
const adminContent = require('../../controllers/adminContentController');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('festivals.list'), adminContent.getFestivals);
router.get('/:id', protect, requirePermission('festivals.list'), adminContent.getFestivalById);
router.post('/', protect, requirePermission('festivals.add'), parseForm, adminContent.saveFestival);
router.put('/:id', protect, requirePermission('festivals.edit'), parseForm, adminContent.saveFestival);
router.delete('/:id', protect, requirePermission('festivals.delete'), adminContent.deleteFestival);

module.exports = router;
