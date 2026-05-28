const express = require('express');
const {
  getStudents,
  saveStudent,
  deleteStudent
} = require('../../controllers/adminController');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('students.list'), getStudents);
router.post('/', protect, requirePermission('students.add'), parseForm, saveStudent);
router.put('/:id', protect, requirePermission('students.edit'), parseForm, saveStudent);
router.delete('/:id', protect, requirePermission('students.delete'), deleteStudent);

module.exports = router;
