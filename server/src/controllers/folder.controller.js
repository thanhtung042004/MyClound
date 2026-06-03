const Folder = require('../models/Folder');
const File = require('../models/File');

// GET /api/folders — list folders
const getFolders = async (req, res) => {
  try {
    const { parent = null } = req.query;
    const query = { owner: req.user._id };
    
    if (parent === 'null' || parent === '') {
      query.parent = null;
    } else if (parent) {
      query.parent = parent;
    }

    const folders = await Folder.find(query).sort('name');
    res.status(200).json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/folders — create folder
const createFolder = async (req, res) => {
  try {
    const { name, parent = null, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Folder name is required.' });

    const folder = await Folder.create({
      name,
      owner: req.user._id,
      parent: parent || null,
      color: color || '#6c63ff',
    });

    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A folder with this name already exists here.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/folders/:id — update folder
const updateFolder = async (req, res) => {
  try {
    const { name, color, isStarred } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    if (isStarred !== undefined) updates.isStarred = isStarred;

    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found.' });

    res.status(200).json({ success: true, data: folder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/folders/:id — delete folder + all contents
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found.' });

    // Recursively get all subfolders
    const getAllSubfolders = async (folderId) => {
      const subs = await Folder.find({ parent: folderId, owner: req.user._id });
      let all = [folderId];
      for (const sub of subs) {
        const nested = await getAllSubfolders(sub._id);
        all = all.concat(nested);
      }
      return all;
    };

    const allFolderIds = await getAllSubfolders(folder._id);

    // Move all files in these folders to trash
    await File.updateMany(
      { owner: req.user._id, folder: { $in: allFolderIds } },
      { isTrashed: true, trashedAt: new Date() }
    );

    // Delete all subfolders + the folder itself
    await Folder.deleteMany({ _id: { $in: allFolderIds }, owner: req.user._id });

    res.status(200).json({ success: true, message: 'Folder deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/folders/:id/breadcrumb — get folder path
const getFolderBreadcrumb = async (req, res) => {
  try {
    const breadcrumb = [];
    let current = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    
    if (!current) return res.status(404).json({ success: false, message: 'Folder not found.' });

    while (current) {
      breadcrumb.unshift({ id: current._id, name: current.name });
      if (current.parent) {
        current = await Folder.findById(current.parent);
      } else {
        break;
      }
    }

    res.status(200).json({ success: true, data: breadcrumb });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFolders, createFolder, updateFolder, deleteFolder, getFolderBreadcrumb };
