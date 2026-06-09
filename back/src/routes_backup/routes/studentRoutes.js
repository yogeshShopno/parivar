const express = require('express');

const { protect, requirePermission } = require('../middleware/auth');
const { parseForm } = require('../middleware/upload');
const { getStudents, addStudent, updateStudent, deleteStudent } = require('../controllers/studentController');

const router = express.Router();

router.get('/', getStudents);
router.post('/', protect, requirePermission('students.add'), parseForm,addStudent );
router.put('/:id', protect, requirePermission('students.edit'), parseForm, updateStudent);
router.delete('/:id', protect, requirePermission('students.delete'), deleteStudent);

module.exports = router;
