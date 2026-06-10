const express = require('express');
const { protect } = require('../middleware/auth');
const { postUpload } = require('../middleware/upload');
const {
  savePost,
  getPosts,
  getPostById,
  deletePost
} = require('../controllers/postController');

const router = express.Router();

// Create/Update post
router.post('/posts', protect, postUpload, savePost);
router.post('/add_post', protect, postUpload, savePost);
router.put('/posts/:id', protect, postUpload, savePost);
router.put('/add_post/:id', protect, postUpload, savePost);

// Get all posts
router.get('/posts', protect, getPosts);
router.get('/all_post_list', protect, getPosts);
router.post('/all_post_list', protect, getPosts);

// Get single post
router.get('/posts/:id', protect, getPostById);

// Delete post
router.delete('/posts/:id', protect, deletePost);

module.exports = router;
