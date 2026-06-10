const express = require('express');
const {
  getNewsList,
  addNews,
  updateNews,
  deleteNews
} = require('../../controllers/newsController');
const { protect, requirePermission } = require('../../middleware/auth');
const { postUpload } = require('../../middleware/upload');

const router = express.Router();

router.get('/', protect, requirePermission('news.list'), getNewsList);
router.post('/', protect, requirePermission('news.add'), postUpload, addNews);
router.put('/:id', protect, requirePermission('news.edit'), postUpload, updateNews);
router.delete('/:id', protect, requirePermission('news.delete'), deleteNews);

module.exports = router;
