const express = require('express');
const router = express.Router();
const {
  getFiles, uploadFiles, deleteFile, updateFile,
  shareFile, revokeShare, getSharedFile, restoreFile, getStats
} = require('../controllers/file.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public shared file route (no auth needed)
router.get('/shared/:token', getSharedFile);

// Protected routes
router.use(protect);

router.get('/stats', getStats);
router.get('/', getFiles);
router.post('/upload', upload.array('files', 20), uploadFiles);
router.put('/:id', updateFile);
router.delete('/:id', deleteFile);
router.post('/:id/share', shareFile);
router.delete('/:id/share', revokeShare);
router.put('/:id/restore', restoreFile);

module.exports = router;
