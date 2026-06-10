const express = require('express');
const {
  getPosts,
  savePost,
  deletePost
} = require('../../controllers/postController');
const { protect, requirePermission } = require('../../middleware/auth');
const { parseForm } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('posts.list'), getPosts);
router.post('/', protect, requirePermission('posts.add'), parseForm, savePost);
router.put('/:id', protect, requirePermission('posts.edit'), parseForm, savePost);
router.delete('/:id', protect, requirePermission('posts.delete'), deletePost);

module.exports = router;
