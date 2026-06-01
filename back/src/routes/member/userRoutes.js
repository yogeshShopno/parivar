const express = require('express');
const { register, login, getProfile, getUsers, updateUser } = require('../../controllers/userController');
const { protect } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();


router.post('/login', parseForm, login);
router.get('/profile', protect, getProfile);
router.get('/', protect, getUsers);
router.get('/:id', protect, (req, res, next) => {
  req.query.id = req.params.id;
  return getUsers(req, res, next);
});
router.post('/',  parseForm, register);
router.put('/:id', protect, updateUser);


module.exports = router;
