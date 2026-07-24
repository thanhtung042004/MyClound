const Link = require('../models/Link');

// Hàm trích xuất domain để tạo favicon URL
function getFaviconUrl(url) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return '';
  }
}

// Hàm trích xuất domain làm title mặc định
function getDomainTitle(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// @desc  Lấy tất cả link của user
// @route GET /api/links
exports.getLinks = async (req, res) => {
  try {
    const { search, tags } = req.query;
    const query = { owner: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (tags) {
      const tagList = tags.split(',').map(t => t.trim().toLowerCase());
      query.tags = { $all: tagList };
    }

    const links = await Link.find(query).sort({ createdAt: -1 });

    res.json({ success: true, data: links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Tạo link mới
// @route POST /api/links
exports.createLink = async (req, res) => {
  try {
    const { url, title, description, color, tags } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL là bắt buộc' });
    }

    // Tự động tạo favicon và title nếu chưa có
    const favicon = getFaviconUrl(url);
    const finalTitle = title?.trim() || getDomainTitle(url);

    const link = await Link.create({
      url,
      title: finalTitle,
      description: description || '',
      favicon,
      color: color || '#6c63ff',
      tags: tags || [],
      owner: req.user._id,
    });

    res.status(201).json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Cập nhật link
// @route PUT /api/links/:id
exports.updateLink = async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, owner: req.user._id });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy link' });
    }

    const { url, title, description, color, tags } = req.body;

    if (url && url !== link.url) {
      link.favicon = getFaviconUrl(url);
      link.url = url;
    }
    if (title !== undefined) link.title = title;
    if (description !== undefined) link.description = description;
    if (color !== undefined) link.color = color;
    if (tags !== undefined) link.tags = tags;

    await link.save();

    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Xóa link
// @route DELETE /api/links/:id
exports.deleteLink = async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy link' });
    }

    res.json({ success: true, message: 'Đã xóa liên kết' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
