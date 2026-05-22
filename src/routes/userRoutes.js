const express = require('express');
const { register, login, getProfile, getUsers, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/', protect, getUsers);
router.get('/list', protect, getUsers);
router.get('/:id', protect, (req, res, next) => {
  req.query.id = req.params.id;
  return getUsers(req, res, next);
});
router.post('/', protect, register);
router.post('/add', protect, register);
router.put('/:id', protect, updateUser);
router.post('/update', protect, updateUser);

module.exports = router;
