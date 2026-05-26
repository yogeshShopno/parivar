const express = require('express');
const { protect } = require('../middleware/auth');
const { postUpload, parseForm } = require('../middleware/upload');
const {
  getHome,
  getGallery,
  getEvents,
  getFestivals
} = require('../controllers/feedController');

const {
  savePost,
  getPosts,
  getPostById
} = require('../controllers/postController');

const router = express.Router();

router.post('/home', protect, parseForm, getHome);
router.get('/home', protect, getHome);
router.post('/gallery', protect, parseForm, getGallery);
router.get('/gallery', protect, getGallery);
router.post('/events', protect, parseForm, getEvents);
router.get('/events', protect, getEvents);
router.post('/festivals', protect, parseForm, getFestivals);
router.get('/festivals', protect, getFestivals);
router.post('/add_post', protect, postUpload, savePost);
router.put('/add_post', protect, postUpload, savePost);
router.post('/all_post_list', protect, parseForm, getPosts);
router.get('/all_post_list', protect, getPosts);
router.get('/posts', protect, getPosts);
router.get('/posts/:id', protect, getPostById);
router.put('/posts/:id', protect, postUpload, savePost);

module.exports = router;
