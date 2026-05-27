const express = require('express');
const { protect, requirePermission } = require('../middleware/auth');
const { parseForm } = require('../middleware/upload');
const { getCategories ,saveCategory ,deleteCategory } = require('../controllers/GalleryCategoryController');

const router = express.Router();

router.get('/gallery-categories', protect, requirePermission('gallery.list'), getCategories);
router.post('/gallery-categories', protect, requirePermission('gallery.add'), parseForm, saveCategory);
router.put('/gallery-categories/:id', protect, requirePermission('gallery.edit'), parseForm, saveCategory);
router.delete('/gallery-categories/:id', protect, requirePermission('gallery.delete'), deleteCategory);

module.exports = router;
