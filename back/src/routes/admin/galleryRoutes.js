const express = require('express');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');
const adminContent = require('../../controllers/adminContentController');

const router = express.Router();

router.get('/gallery', protect, requirePermission('gallery.list'), adminContent.getGallery);
router.post('/gallery', protect, requirePermission('gallery.add'), parseForm, adminContent.saveGallery);
router.put('/gallery/:id', protect, requirePermission('gallery.edit'), parseForm, adminContent.saveGallery);
router.delete('/gallery/:id', protect, requirePermission('gallery.delete'), adminContent.deleteGallery);

module.exports = router;
