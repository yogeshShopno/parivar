const express = require('express');
const { login, selectAccountLogin, versionCode } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { parseForm } = require('../middleware/upload');

const router = express.Router();

router.post('/login', parseForm, login);
router.post('/select_account_login', parseForm, selectAccountLogin);
router.post('/version_code', protect, parseForm, versionCode);

module.exports = router;
