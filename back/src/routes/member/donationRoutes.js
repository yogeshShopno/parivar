const express = require('express');
const {
  getDonations,
  addDonation,
  updateDonation,
  deleteDonation
} = require('../../controllers/donationController');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.get('/', protect, getDonations);
router.post('/', protect, addDonation);
router.put('/:id', protect, updateDonation);
router.delete('/:id', protect, deleteDonation);

module.exports = router;
