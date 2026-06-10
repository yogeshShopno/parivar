const express = require('express');

const { postUpload } = require('../middleware/upload');
const { requirePermission, protect } = require('../middleware/auth');

const { getEventsList,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent } = require('../controllers/eventController');

const router = express.Router();

router.get('/', getEventsList);
router.get('/:id', getEventById);
router.post('/', protect, requirePermission('events.add'), postUpload, addEvent);
router.put('/:id', protect, requirePermission('events.edit'), postUpload, updateEvent);
router.delete('/:id', protect, requirePermission('events.delete'), deleteEvent);

module.exports = router;
