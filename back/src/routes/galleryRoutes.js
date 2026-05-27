const express = require('express');
const { parseForm } = require('../middleware/upload');
const { getGallery ,saveGallery ,deleteGallery} = require('../controllers/GalleryController');
const { protect, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/gallery', protect, requirePermission('gallery.list'), getGallery);
router.post('/gallery', protect, requirePermission('gallery.add'), parseForm,saveGallery);
router.put('/gallery/:id', protect, requirePermission('gallery.edit'), parseForm,saveGallery);
router.delete('/gallery/:id', protect, requirePermission('gallery.delete'),deleteGallery);

module.exports = router;
