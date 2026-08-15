const express = require('express');
const router = express.Router();
const multer = require('multer');
const { translateImage, translateVideo } = require('../controllers/translate.controller');
const { protect } = require('../middleware/auth');

// Use memory storage so we can pass buffer to Gemini directly
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// POST /api/translate/image
router.post('/image', protect, upload.single('file'), translateImage);

// POST /api/translate/video
router.post('/video', protect, upload.single('file'), translateVideo);

module.exports = router;
