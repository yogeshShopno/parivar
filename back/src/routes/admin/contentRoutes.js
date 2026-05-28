const express = require('express');
const adminContent = require('../../controllers/adminContentController');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

// Festival routes are now moved directly to routes/admin/festivalRoutes.js

// Event routes
router.get('/events', protect, requirePermission('events.list'), adminContent.getEvents);
router.post('/events', protect, requirePermission('events.add'), parseForm, adminContent.saveEvent);
router.put('/events/:id', protect, requirePermission('events.edit'), parseForm, adminContent.saveEvent);
router.delete('/events/:id', protect, requirePermission('events.delete'), adminContent.deleteEvent);


// Banner routes
router.get('/banners', protect, requirePermission('banners.list'), adminContent.getBanners);
router.post('/banners', protect, requirePermission('banners.add'), parseForm, adminContent.saveBanner);
router.put('/banners/:id', protect, requirePermission('banners.edit'), parseForm, adminContent.saveBanner);
router.delete('/banners/:id', protect, requirePermission('banners.delete'), adminContent.deleteBanner);

// Contact inquiry routes
router.get('/contact-inquiries', protect, requirePermission('contact-inquiries.list'), adminContent.getInquiries);
router.post('/contact-inquiries', protect, requirePermission('contact-inquiries.edit'), parseForm, adminContent.saveInquiry);
router.put('/contact-inquiries/:id', protect, requirePermission('contact-inquiries.edit'), parseForm, adminContent.saveInquiry);
router.delete('/contact-inquiries/:id', protect, requirePermission('contact-inquiries.delete'), adminContent.deleteInquiry);

module.exports = router;
