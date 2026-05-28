const express = require('express');
const {
  getMatrimonies,
  addMatrimony,
  updateMatrimony,
  deleteMatrimony
} = require('../../controllers/matrimonyController');
const { protect } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/',  getMatrimonies);
router.post('/', parseForm, addMatrimony);
router.put('/:id', protect, parseForm, updateMatrimony);
router.delete('/:id', protect, deleteMatrimony);

module.exports = router;
