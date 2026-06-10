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

// allow optional authentication: attach req.user if token present
const optionalProtect = async (req, res, next) => {
  const { getTokenFromRequest } = require('../middleware/auth');
  const token = getTokenFromRequest(req);
  if (token) {
    return protect(req, res, next);
  }
  return next();
};

router.get('/', protect, getRegistrationsList);
router.get('/download', protect, downloadRegistrations);  
router.get('/:id', protect, getRegistrationById);
router.post('/', optionalProtect, addRegistration);
router.put('/:id', protect, updateRegistration);
router.patch('/:id/cancel', protect, cancelRegistration);


module.exports = router;