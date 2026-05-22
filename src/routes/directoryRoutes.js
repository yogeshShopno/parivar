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
router.get('/members', protect, getMembers);
router.get('/members/:member_id', protect, (req, res, next) => {
  req.query.member_id = req.params.member_id;
  return getMembers(req, res, next);
});
router.post('/family_members', protect, parseForm, getFamilyMembers);
router.get('/family_members', protect, getFamilyMembers);
router.post('/kamiti_members', protect, parseForm, getKamitiMembers);
router.get('/kamiti_members', protect, getKamitiMembers);
router.post('/country_list', protect, parseForm, getCountryList);
router.get('/country_list', protect, getCountryList);
router.post('/state_list', protect, parseForm, getStateList);
router.get('/state_list', protect, getStateList);
router.post('/city_list', protect, parseForm, getCityList);
router.get('/city_list', protect, getCityList);

module.exports = router;
