const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// GET /api/files — list files (with filters)
const getFiles = async (req, res) => {
  try {
    const { folder = null, search, type, starred, trashed = false, sort = '-createdAt', page = 1, limit = 50 } = req.query;

    const query = {
      owner: req.user._id,
      isTrashed: trashed === 'true',
    };

    if (folder === 'null' || folder === '') {
      query.folder = null;
    } else if (folder) {
      query.folder = folder;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (type) {
      const typeMap = {
        image: 'image',
        video: 'video',
        document: 'raw',
      };
      if (typeMap[type]) query.resourceType = typeMap[type];
    }

    if (starred === 'true') query.isStarred = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const files = await File.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('folder', 'name');

    const total = await File.countDocuments(query);

    res.status(200).json({
      success: true,
      data: files,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/files/upload — upload files
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    const { folder = null } = req.body;
    const savedFiles = [];
    let totalSize = 0;

    for (const file of req.files) {
      const resourceType = file.mimetype.startsWith('image/') ? 'image'
        : file.mimetype.startsWith('video/') ? 'video'
        : 'raw';

      const thumbnailUrl = file.eager && file.eager[0] ? file.eager[0].secure_url : null;

      // Fix: multer may receive filename as Latin-1, decode back to UTF-8
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

      const newFile = await File.create({
        name: originalName.replace(/\.[^.]+$/, ''),
        originalName: originalName,
        owner: req.user._id,
        folder: folder || null,
        publicId: file.filename,
        url: file.path,
        secureUrl: file.path,
        thumbnailUrl,
        format: originalName.split('.').pop()?.toLowerCase() || '',
        resourceType,
        mimeType: file.mimetype,
        size: file.size,
        width: file.width,
        height: file.height,
      });

      savedFiles.push(newFile);
      totalSize += file.size;
    }

    // Update user storage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: totalSize },
    });

    res.status(201).json({
      success: true,
      message: `${savedFiles.length} file(s) uploaded successfully.`,
      data: savedFiles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/files/:id — move to trash or permanent delete
const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    const { permanent = false } = req.query;

    if (permanent === 'true' || file.isTrashed) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(file.publicId, { resource_type: file.resourceType });
      
      // Update storage
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: -file.size },
      });

      await file.deleteOne();
      return res.status(200).json({ success: true, message: 'File permanently deleted.' });
    }

    // Move to trash
    file.isTrashed = true;
    file.trashedAt = new Date();
    await file.save();

    res.status(200).json({ success: true, message: 'File moved to trash.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/files/:id — update file (name, folder, starred, etc)
const updateFile = async (req, res) => {
  try {
    const { name, folder, isStarred, description, tags } = req.body;
    const updates = {};
    
    if (name !== undefined) updates.name = name;
    if (folder !== undefined) updates.folder = folder || null;
    if (isStarred !== undefined) updates.isStarred = isStarred;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;

    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('folder', 'name');

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    res.status(200).json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/files/:id/share — create share link
const shareFile = async (req, res) => {
  try {
    const { permission = 'view', expiresIn } = req.body;
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    const shareToken = uuidv4();
    const shareExpiresAt = expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 1000) : null;

    file.isShared = true;
    file.shareToken = shareToken;
    file.shareExpiresAt = shareExpiresAt;
    file.sharePermission = permission;
    await file.save();

    const shareUrl = `${process.env.CLIENT_URL}/share/${shareToken}`;

    res.status(200).json({
      success: true,
      shareToken,
      shareUrl,
      shareExpiresAt,
      permission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/files/:id/share — revoke share link
const revokeShare = async (req, res) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isShared: false, shareToken: null, shareExpiresAt: null },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    res.status(200).json({ success: true, message: 'Share link revoked.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/files/shared/:token — public view shared file
const getSharedFile = async (req, res) => {
  try {
    const file = await File.findOne({ shareToken: req.params.token, isShared: true })
      .populate('owner', 'name avatar');

    if (!file) {
      return res.status(404).json({ success: false, message: 'Shared link not found or expired.' });
    }

    if (file.shareExpiresAt && new Date() > file.shareExpiresAt) {
      return res.status(410).json({ success: false, message: 'Share link has expired.' });
    }

    res.status(200).json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/files/:id/restore — restore from trash
const restoreFile = async (req, res) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id, isTrashed: true },
      { isTrashed: false, trashedAt: null },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found in trash.' });
    }

    res.status(200).json({ success: true, message: 'File restored.', data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/files/stats — user storage stats
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [imageStat, videoStat, docStat, totalCount] = await Promise.all([
      File.aggregate([
        { $match: { owner: userId, resourceType: 'image', isTrashed: false } },
        { $group: { _id: null, size: { $sum: '$size' }, count: { $sum: 1 } } },
      ]),
      File.aggregate([
        { $match: { owner: userId, resourceType: 'video', isTrashed: false } },
        { $group: { _id: null, size: { $sum: '$size' }, count: { $sum: 1 } } },
      ]),
      File.aggregate([
        { $match: { owner: userId, resourceType: 'raw', isTrashed: false } },
        { $group: { _id: null, size: { $sum: '$size' }, count: { $sum: 1 } } },
      ]),
      File.countDocuments({ owner: userId, isTrashed: false }),
    ]);

    const recentFiles = await File.find({ owner: userId, isTrashed: false })
      .sort('-createdAt')
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        totalFiles: totalCount,
        storageUsed: req.user.storageUsed,
        storageLimit: req.user.storageLimit,
        byType: {
          image: imageStat[0] || { size: 0, count: 0 },
          video: videoStat[0] || { size: 0, count: 0 },
          document: docStat[0] || { size: 0, count: 0 },
        },
        recentFiles,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFiles,
  uploadFiles,
  deleteFile,
  updateFile,
  shareFile,
  revokeShare,
  getSharedFile,
  restoreFile,
  getStats,
};
