const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null, // null = root
  },
  // Cloudinary info
  publicId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  secureUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: null,
  },
  format: {
    type: String,
    required: true,
  },
  resourceType: {
    type: String,
    enum: ['image', 'video', 'raw', 'auto'],
    default: 'auto',
  },
  mimeType: {
    type: String,
  },
  size: {
    type: Number,
    required: true, // bytes
  },
  width: Number,
  height: Number,
  duration: Number, // for video in seconds
  // Sharing
  isShared: {
    type: Boolean,
    default: false,
  },
  shareToken: {
    type: String,
    default: null,
  },
  shareExpiresAt: {
    type: Date,
    default: null,
  },
  sharePermission: {
    type: String,
    enum: ['view', 'download'],
    default: 'view',
  },
  // Meta
  isStarred: {
    type: Boolean,
    default: false,
  },
  isTrashed: {
    type: Boolean,
    default: false,
  },
  trashedAt: {
    type: Date,
    default: null,
  },
  tags: [{ type: String, lowercase: true }],
  downloadCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Text index for search
fileSchema.index({ name: 'text', originalName: 'text', tags: 'text' });
fileSchema.index({ owner: 1, folder: 1 });
// Use partialFilterExpression to ignore nulls completely
fileSchema.index(
  { shareToken: 1 }, 
  { unique: true, partialFilterExpression: { shareToken: { $type: 'string' } } }
);

module.exports = mongoose.model('File', fileSchema);
