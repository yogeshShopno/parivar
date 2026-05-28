const express = require('express');
const {
  adminGetDonations,
  adminSaveDonation,
  adminDeleteDonation
} = require('../../controllers/donationController');
const { protect, requirePermission } = require('../../middleware/auth');

const router = express.Router();

router.get('/', protect, requirePermission('donations.list'), adminGetDonations);
router.post('/', protect, requirePermission('donations.add'), adminSaveDonation);
router.put('/:id', protect, requirePermission('donations.edit'), adminSaveDonation);
router.delete('/:id', protect, requirePermission('donations.delete'), adminDeleteDonation);

module.exports = router;
