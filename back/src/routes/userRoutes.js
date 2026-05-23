const express = require('express');
const { register, login, getProfile, getUsers, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { parseForm } = require('../middleware/upload');

const router = express.Router();

router.post('/register', parseForm, register);
router.post('/login', parseForm, login);
router.get('/profile', protect, getProfile);
router.get('/', protect, getUsers);
router.get('/list', protect, getUsers);
router.get('/:id', protect, (req, res, next) => {
  req.query.id = req.params.id;
  return getUsers(req, res, next);
});
router.post('/', protect, parseForm, register);
router.post('/add', protect, parseForm, register);
router.put('/:id', protect, parseForm, updateUser);
router.post('/update', protect, parseForm, updateUser);

module.exports = router;
