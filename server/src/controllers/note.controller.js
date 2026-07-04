const Note = require('../models/Note');

// GET /api/notes
exports.getNotes = async (req, res) => {
  try {
    const { search, sort = '-updatedAt' } = req.query;
    const query = { owner: req.user._id };

    if (search) {
      query.$text = { $search: search };
    }

    const notes = await Note.find(query).sort(sort).lean();
    res.json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const { title, content, color, tags } = req.body;
    const note = await Note.create({
      title: title || 'Ghi chú mới',
      content: content || '',
      color: color || '#6c63ff',
      tags: tags || [],
      owner: req.user._id,
    });
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Không tìm thấy ghi chú' });

    const { title, content, isStarred, color, tags } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (isStarred !== undefined) note.isStarred = isStarred;
    if (color !== undefined) note.color = color;
    if (tags !== undefined) note.tags = tags;

    await note.save();
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Không tìm thấy ghi chú' });
    res.json({ success: true, message: 'Đã xóa ghi chú' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notes/:id/download  – download as .txt
exports.downloadNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Không tìm thấy ghi chú' });

    const filename = `${note.title.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\s]/g, '')}.txt`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(note.content);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
