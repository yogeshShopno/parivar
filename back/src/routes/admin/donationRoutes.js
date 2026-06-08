const express = require('express');
const {
  adminGetDonations,
  adminSaveDonation,
  adminDeleteDonation,
  exportDonations
} = require('../../controllers/donationController');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('donations.list'), adminGetDonations);
router.post('/', protect, requirePermission('donations.add'), parseForm, adminSaveDonation);
router.put('/:id', protect, requirePermission('donations.edit'), parseForm, adminSaveDonation);
router.delete('/:id', protect, requirePermission('donations.delete'), adminDeleteDonation);
router.get('/export', protect, requirePermission('donations.list'), exportDonations); 

module.exports = router;
