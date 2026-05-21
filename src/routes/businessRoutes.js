const express = require('express');
const { protect } = require('../middleware/auth');
const { businessUpload, parseForm } = require('../middleware/upload');
const {
  getBusinessCategoryList,
  addBusinessDetails,
  getBusinessDetailsList
} = require('../controllers/businessController');

const router = express.Router();

router.post('/business_category_list', protect, parseForm, getBusinessCategoryList);
router.post('/add_business_details', protect, businessUpload, addBusinessDetails);
router.post('/business_details_list', protect, parseForm, getBusinessDetailsList);

module.exports = router;
