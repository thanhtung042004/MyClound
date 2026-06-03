const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { downloadFromUrl, getUrlInfo, downloadToDevice } = require('../controllers/download.controller');

router.get('/info', protect, getUrlInfo);
router.post('/from-url', protect, downloadFromUrl);
router.post('/to-device', protect, downloadToDevice);

module.exports = router;
