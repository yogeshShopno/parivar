const express = require('express');
const {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent
} = require('../../controllers/studentController');
const { protect } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, getStudents);
router.post('/', protect, parseForm, addStudent);
router.put('/:id', protect, parseForm, updateStudent);
router.delete('/:id', protect, deleteStudent);

module.exports = router;
