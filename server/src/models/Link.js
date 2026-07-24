const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
  },
  title: {
    type: String,
    trim: true,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  favicon: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  color: {
    type: String,
    default: '#6c63ff',
  },
  tags: [{ type: String, lowercase: true }],
}, { timestamps: true });

linkSchema.index({ owner: 1, createdAt: -1 });
linkSchema.index({ title: 'text', url: 'text', tags: 'text' });

module.exports = mongoose.model('Link', linkSchema);
