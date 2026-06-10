const express = require('express');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../../controllers/adminController');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('members.list', ), getUsers);
router.post('/', protect, requirePermission('members.add', ), parseForm, createUser);
router.put('/:id', protect, requirePermission('members.edit', ), parseForm, updateUser);
router.delete('/:id', protect, requirePermission('members.delete', ), deleteUser);

module.exports = router;
