const express = require('express');
const { protect } = require('../middleware/auth');
const { businessUpload, parseForm } = require('../middleware/upload');
const {
  getBusinessCategoryList,
  addBusinessDetails,
  getBusinessDetailsList
} = require('../controllers/businessController');

const router = express.Router();

router.post('/business_category_list', parseForm, getBusinessCategoryList);
router.get('/business_category_list', getBusinessCategoryList);
router.post('/add_business_details', protect, businessUpload, addBusinessDetails);
router.put('/add_business_details', protect, businessUpload, addBusinessDetails);
router.post('/business_details_list', protect, parseForm, getBusinessDetailsList);
router.get('/business_details_list', protect, getBusinessDetailsList);
router.get('/businesses', protect, getBusinessDetailsList);
router.get('/businesses/:id', protect, (req, res, next) => {
  req.query.id = req.params.id;
  return getBusinessDetailsList(req, res, next);
});
router.put('/businesses/:id', protect, businessUpload, (req, res, next) => {
  req.body.id = req.params.id;
  return addBusinessDetails(req, res, next);
});

module.exports = router;
