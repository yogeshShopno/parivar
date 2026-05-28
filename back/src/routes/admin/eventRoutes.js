const express = require('express');
const {
  getEventsList,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../../controllers/eventController');
const { protect, requirePermission } = require('../../middleware/auth');
const { postUpload } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('events.list'), getEventsList);
router.post('/', protect, requirePermission('events.add'), postUpload, createEvent);
router.put('/:id', protect, requirePermission('events.edit'), postUpload, updateEvent);
router.delete('/:id', protect, requirePermission('events.delete'), deleteEvent);

module.exports = router;
