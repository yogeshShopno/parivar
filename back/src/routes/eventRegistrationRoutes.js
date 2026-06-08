const router = require('express').Router();
const {
  getRegistrationsList,
  getRegistrationById,
  addRegistration,
  updateRegistration,
  cancelRegistration,
  downloadRegistrations   
} = require('../controllers/eventRegistrationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRegistrationsList);
router.get('/download', protect, downloadRegistrations);  
router.get('/:id', getRegistrationById);
router.post('/', addRegistration);
router.put('/:id', updateRegistration);
router.patch('/:id/cancel', cancelRegistration);


module.exports = router;