const express = require('express');
const {
  getMatrimonies,
  getMatrimonyById,
  addMatrimony,
  updateMatrimony,
  deleteMatrimony
} = require('../../controllers/matrimonyController');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('matrimonies.list'), getMatrimonies);
router.get('/:id', protect, requirePermission('matrimonies.list'), getMatrimonyById);
router.post('/', protect, requirePermission('matrimonies.add'), parseForm, addMatrimony);
router.put('/:id', protect, requirePermission('matrimonies.edit'), parseForm, updateMatrimony);
router.delete('/:id', protect, requirePermission('matrimonies.delete'), deleteMatrimony);

module.exports = router;
