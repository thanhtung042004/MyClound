const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

// Determine resource type from mimetype
const getResourceType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'video'; // Cloudinary treats audio as video resource
  return 'raw';
};

const allowedMimeTypes = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
  'video/mp4', 'video/mpeg', 'video/quicktime', 'video/avi', 'video/webm', 'video/mkv',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/json',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
]);

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported`), false);
  }
};

// Dùng memoryStorage — buffer file trong RAM để stream lên Cloudinary
// Điều này loại bỏ phụ thuộc vào multer-storage-cloudinary (cloudinary v1)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per file
});

/**
 * Upload một buffer lên Cloudinary qua stream
 * Trả về cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Middleware xử lý upload sau khi multer đã buffer file vào req.file / req.files
 * Tự động upload lên Cloudinary và gắn kết quả vào file object
 */
const processUpload = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) return next();

    // Upload tất cả files lên Cloudinary song song
    await Promise.all(files.map(async (file) => {
      const resourceType = getResourceType(file.mimetype);
      const options = {
        resource_type: resourceType,
        folder: `myclound/${req.user.id}`,
        use_filename: true,
        unique_filename: true,
        // Tạo thumbnail cho ảnh
        eager: resourceType === 'image'
          ? [{ width: 300, height: 300, crop: 'fill', quality: 'auto' }]
          : undefined,
      };

      const result = await uploadBufferToCloudinary(file.buffer, options);

      // Gắn kết quả cloudinary vào file object (tương thích với code cũ)
      file.filename = result.public_id;
      file.path = result.secure_url;
      file.cloudinaryResult = result;
      file.eager = result.eager;
      file.width = result.width;
      file.height = result.height;

      // Giải phóng buffer sau khi upload xong
      file.buffer = null;
    }));

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, processUpload, uploadBufferToCloudinary };
