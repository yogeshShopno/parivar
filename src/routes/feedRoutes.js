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
router.get('/home', protect, getHome);
router.post('/gallery', protect, parseForm, getGallery);
router.get('/gallery', protect, getGallery);
router.post('/events', protect, parseForm, getEvents);
router.get('/events', protect, getEvents);
router.post('/festivals', protect, parseForm, getFestivals);
router.get('/festivals', protect, getFestivals);
router.post('/add_post', protect, postUpload, addPost);
router.put('/add_post', protect, postUpload, addPost);
router.post('/all_post_list', protect, parseForm, getAllPostList);
router.get('/all_post_list', protect, getAllPostList);
router.get('/posts', protect, getAllPostList);
router.get('/posts/:id', protect, (req, res, next) => {
  req.query.id = req.params.id;
  return getAllPostList(req, res, next);
});
router.put('/posts/:id', protect, postUpload, (req, res, next) => {
  req.body.id = req.params.id;
  return addPost(req, res, next);
});

module.exports = router;
