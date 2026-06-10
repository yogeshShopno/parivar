const express = require('express');
const festivalController = require('../../controllers/festivalController');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('festivals.list'), festivalController.adminGetFestivals);
router.get('/:id', protect, requirePermission('festivals.list'), festivalController.getFestivalById);
router.post('/', protect, requirePermission('festivals.add'), parseForm, festivalController.saveFestival);
router.put('/:id', protect, requirePermission('festivals.edit'), parseForm, festivalController.saveFestival);
router.delete('/:id', protect, requirePermission('festivals.delete'), festivalController.deleteFestival);

module.exports = router;
