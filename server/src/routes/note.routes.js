const express = require('express');
const router = express.Router();
const { getNotes, createNote, updateNote, deleteNote, downloadNote } = require('../controllers/note.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.get('/:id/download', downloadNote);

module.exports = router;
