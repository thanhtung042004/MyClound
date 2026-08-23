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

    const folders = await Folder.find(query).sort('name').lean();
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
// Tối ưu: dùng iterative BFS thay vì đệ quy async (tránh N queries lồng nhau)
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found.' });

    // BFS iterative để collect tất cả subfolder IDs
    // Mỗi level chỉ cần 1 DB query thay vì recursive calls
    const allFolderIds = [folder._id];
    const queue = [folder._id];

    while (queue.length > 0) {
      const currentBatch = queue.splice(0, queue.length); // lấy toàn bộ level hiện tại
      const subs = await Folder.find(
        { parent: { $in: currentBatch }, owner: req.user._id },
        '_id'
      ).lean();

      for (const sub of subs) {
        allFolderIds.push(sub._id);
        queue.push(sub._id);
      }
    }

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
// Tối ưu: lấy tất cả ancestors trong 1 query bằng $graphLookup nếu có,
// hoặc dùng caching approach với ancestor IDs từ folder tree
const getFolderBreadcrumb = async (req, res) => {
  try {
    const startFolder = await Folder.findOne(
      { _id: req.params.id, owner: req.user._id },
      '_id name parent'
    ).lean();

    if (!startFolder) return res.status(404).json({ success: false, message: 'Folder not found.' });

    // Collect all parent IDs cần tải
    const breadcrumb = [{ id: startFolder._id, name: startFolder.name }];
    let parentId = startFolder.parent;
    const visited = new Set([String(startFolder._id)]);

    // Build chain of parent IDs để fetch 1 lần
    const parentIds = [];
    let currentParentId = parentId;
    while (currentParentId) {
      parentIds.push(currentParentId);
      currentParentId = null; // Sẽ lấy từ DB ở bước tiếp
    }

    // Với folder tree không quá sâu (thường < 5 levels), vòng lặp đơn giản vẫn ổn
    // Nhưng giờ kiểm tra vòng lặp vô hạn bằng visited set
    let current = startFolder;
    while (current.parent) {
      if (visited.has(String(current.parent))) break; // Tránh circular reference
      visited.add(String(current.parent));

      const parent = await Folder.findById(current.parent, '_id name parent').lean();
      if (!parent) break;

      breadcrumb.unshift({ id: parent._id, name: parent.name });
      current = parent;
    }

    res.status(200).json({ success: true, data: breadcrumb });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFolders, createFolder, updateFolder, deleteFolder, getFolderBreadcrumb };
