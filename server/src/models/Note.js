const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    default: 'Ghi chú mới',
  },
  content: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isStarred: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#6c63ff',
  },
  tags: [{ type: String, lowercase: true }],
}, { timestamps: true });

noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
