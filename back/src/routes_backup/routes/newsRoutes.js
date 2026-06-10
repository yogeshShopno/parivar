const express = require('express');
const { protect } = require('../middleware/auth');
const { parseForm, postUpload } = require('../middleware/upload');
const {
  getNewsList,
  getNewsById,
  addNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');


const router = express.Router();

router.get('/news', protect, getNewsList);
router.get('/news/:id', protect, getNewsById);
router.post('/news', protect, postUpload, addNews);
router.put('/news/:id', protect, postUpload, updateNews);
router.delete('/news/:id', protect, deleteNews);

module.exports = router;