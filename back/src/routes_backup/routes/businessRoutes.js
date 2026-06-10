const express = require('express');
const { protect } = require('../middleware/auth');
const { businessUpload, parseForm } = require('../middleware/upload');
const { getBusinessCategoryList, addBusinessDetails, getBusinesses, getBusinessById, deleteBusiness } = require('../controllers/businessController');


const router = express.Router();

router.get('/business_category_list',  getBusinessCategoryList);
router.post('/', protect, parseForm, addBusinessDetails);
router.put('/:id', protect, parseForm, addBusinessDetails);

router.get('/', getBusinesses);
router.get('/:id',getBusinessById);
// Protected actions
router.delete('/:id', protect, deleteBusiness);


module.exports = router;
