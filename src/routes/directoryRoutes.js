const express = require('express');
const { protect } = require('../middleware/auth');
const { parseForm } = require('../middleware/upload');
const {
  getMembers,
  getFamilyMembers,
  getKamitiMembers,
  getCountryList,
  getStateList,
  getCityList
} = require('../controllers/directoryController');

const router = express.Router();

router.post('/members', protect, parseForm, getMembers);
router.post('/family_members', protect, parseForm, getFamilyMembers);
router.post('/kamiti_members', protect, parseForm, getKamitiMembers);
router.post('/country_list', protect, parseForm, getCountryList);
router.post('/state_list', protect, parseForm, getStateList);
router.post('/city_list', protect, parseForm, getCityList);

module.exports = router;
