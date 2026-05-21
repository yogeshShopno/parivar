const express = require('express');
const { protect } = require('../middleware/auth');
const { postUpload, parseForm } = require('../middleware/upload');
const {
  getHome,
  getGallery,
  getEvents,
  getFestivals,
  addPost,
  getAllPostList
} = require('../controllers/feedController');

const router = express.Router();

router.post('/home', protect, parseForm, getHome);
router.post('/gallery', protect, parseForm, getGallery);
router.post('/events', protect, parseForm, getEvents);
router.post('/festivals', protect, parseForm, getFestivals);
router.post('/add_post', protect, postUpload, addPost);
router.post('/all_post_list', protect, parseForm, getAllPostList);

module.exports = router;
