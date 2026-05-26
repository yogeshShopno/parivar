const express = require('express');
const { protect } = require('../middleware/auth');
const { postUpload, parseForm } = require('../middleware/upload');
const {
  savePost,
  getPosts,
  getPostById
} = require('../controllers/postController');

const router = express.Router();

router.post('/posts', protect, postUpload, savePost);
router.put('/posts/:id', protect, postUpload, savePost);
router.get('/posts', protect, getPosts);
router.get('/posts/:id', protect, getPostById);
router.put('/posts/:id', protect, postUpload, savePost);

module.exports = router;
