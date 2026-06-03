const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Folder name is required'],
    trim: true,
    maxlength: [100, 'Folder name cannot exceed 100 characters'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null, // null = root level
  },
  color: {
    type: String,
    default: '#6c63ff',
  },
  isStarred: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Prevent duplicate folder names in same parent for same user
folderSchema.index({ name: 1, parent: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);
