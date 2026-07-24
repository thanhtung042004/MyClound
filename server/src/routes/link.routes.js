const express = require('express');
const router = express.Router();
const { getLinks, createLink, updateLink, deleteLink } = require('../controllers/link.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getLinks);
router.post('/', createLink);
router.put('/:id', updateLink);
router.delete('/:id', deleteLink);

module.exports = router;
