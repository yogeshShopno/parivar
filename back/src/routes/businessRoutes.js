const express = require('express');
const { protect } = require('../middleware/auth');
const { businessUpload, parseForm } = require('../middleware/upload');
const { getBusinessCategoryList, addBusinessDetails, getBusinesses, getBusinessById, deleteBusiness } = require('../controllers/businessController');


const router = express.Router();

router.get('/business_category_list',  getBusinessCategoryList);
router.post('/', protect, businessUpload, addBusinessDetails);
router.put('/:id', protect, businessUpload, addBusinessDetails);

router.get('/', getBusinesses);
router.get('/:id',protect, getBusinessById);
// Protected actions
router.delete('/:id', protect, deleteBusiness);


module.exports = router;
