const express = require('express');
const router = express.Router();
const { getFolders, createFolder, updateFolder, deleteFolder, getFolderBreadcrumb } = require('../controllers/folder.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getFolders);
router.post('/', createFolder);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);
router.get('/:id/breadcrumb', getFolderBreadcrumb);

module.exports = router;
