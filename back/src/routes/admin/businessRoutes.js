const express = require('express');
const {
  getBusinesses,
  saveBusiness,
  deleteBusiness
} = require('../../controllers/adminController');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('businesses.list'), getBusinesses);
router.post('/', protect, requirePermission('businesses.add'), parseForm, saveBusiness);
router.put('/:id', protect, requirePermission('businesses.edit'), parseForm, saveBusiness);
router.delete('/:id', protect, requirePermission('businesses.delete'), deleteBusiness);

module.exports = router;
