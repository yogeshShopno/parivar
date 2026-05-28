const express = require('express');
const { protect } = require('../middleware/auth');
const { businessUpload, parseForm } = require('../middleware/upload');
const {
  getBusinessCategoryList,
  addBusinessDetails,
  getBusinesses,
  getBusinessById,
  deleteBusiness,
} = require('../controllers/businessController');

const router = express.Router();

router.post('/business_category_list', parseForm, getBusinessCategoryList);
router.get('/business_category_list', getBusinessCategoryList);
router.post('/add_business_details', protect, businessUpload, addBusinessDetails);
router.put('/add_business_details', protect, businessUpload, addBusinessDetails);
router.get('/businesses', protect, getBusinesses);
router.get('/businesses/:id', protect, getBusinessById);
router.delete('/businesses/:id', protect, deleteBusiness);


module.exports = router;
