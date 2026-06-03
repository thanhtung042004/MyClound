const axios = require('axios');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');
const File = require('../models/File');
const User = require('../models/User');
const YTDlpWrap = require('yt-dlp-wrap').default;

// Các domain mạng xã hội cần dùng yt-dlp
const SOCIAL_DOMAINS = [
  'youtube.com', 'youtu.be',
  'tiktok.com', 'vm.tiktok.com',
  'instagram.com', 'facebook.com', 'fb.watch',
  'twitter.com', 'x.com',
  'vimeo.com',
];

const isSocialUrl = (url) => {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return SOCIAL_DOMAINS.some(d => host.includes(d));
  } catch {
    return false;
  }
};

// Đảm bảo yt-dlp binary được cài
let ytDlp = null;
const getYtDlp = async () => {
  if (ytDlp) return ytDlp;
  
  const dirPath = path.join(os.homedir(), '.yt-dlp');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const isWin = os.platform() === 'win32';
  const binPath = path.join(dirPath, isWin ? 'yt-dlp.exe' : 'yt-dlp');
  
  ytDlp = new YTDlpWrap(binPath);
  try {
    await ytDlp.getVersion();
  } catch {
    // Binary chưa tồn tại, tải về
    await YTDlpWrap.downloadFromGithub(binPath);
    ytDlp = new YTDlpWrap(binPath);
  }
  return ytDlp;
};

// POST /api/download/from-url
const downloadFromUrl = async (req, res) => {
  const { url, format = 'video', quality = 'best' } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'Thiếu URL' });
  }

  const tmpDir = os.tmpdir();
  let tmpFile = null;

  try {
    let fileBuffer, fileName, mimeType, resourceType;

    if (isSocialUrl(url)) {
      // --- Dùng yt-dlp cho YouTube/TikTok/... ---
      const yt = await getYtDlp();

      // Lấy metadata trước
      const info = await yt.getVideoInfo(url);
      const title = info.title || 'download';
      const safeTitle = title.replace(/[^\w\s-]/g, '').trim().substring(0, 80);

      let ext, ytFormat;
      if (format === 'mp3' || format === 'audio') {
        ext = 'mp3';
        mimeType = 'audio/mpeg';
        resourceType = 'video'; // Cloudinary dùng 'video' cho audio
        ytFormat = ['-x', '--audio-format', 'mp3', '--audio-quality', '0'];
      } else {
        ext = 'mp4';
        mimeType = 'video/mp4';
        resourceType = 'video';
        ytFormat = ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', '--merge-output-format', 'mp4'];
      }

      fileName = `${safeTitle}.${ext}`;
      tmpFile = path.join(tmpDir, `dl_${Date.now()}.${ext}`);

      await new Promise((resolve, reject) => {
        yt.exec([url, ...ytFormat, '-o', tmpFile])
          .on('ytDlpEvent', () => {})
          .on('error', reject)
          .on('close', resolve);
      });

      fileBuffer = fs.readFileSync(tmpFile);

    } else {
      // --- Download trực tiếp cho URL thường ---
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxContentLength: 500 * 1024 * 1024, // 500MB
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      fileBuffer = Buffer.from(response.data);
      mimeType = response.headers['content-type']?.split(';')[0] || 'application/octet-stream';

      // Lấy tên file từ URL hoặc header
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        fileName = disposition.split('filename=')[1].replace(/['"]/g, '');
      } else {
        const urlPath = new URL(url).pathname;
        fileName = path.basename(urlPath) || `download_${Date.now()}`;
      }

      resourceType = mimeType.startsWith('image/') ? 'image'
        : mimeType.startsWith('video/') ? 'video'
        : 'raw';
    }

    // Upload lên Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'myclound',
          use_filename: true,
          unique_filename: true,
        },
        (err, result) => err ? reject(err) : resolve(result)
      );
      Readable.from(fileBuffer).pipe(stream);
    });

    // Lưu vào DB
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const name = fileName.replace(/\.[^.]+$/, '');

    const newFile = await File.create({
      name,
      originalName: fileName,
      owner: req.user._id,
      folder: null,
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      secureUrl: uploadResult.secure_url,
      thumbnailUrl: resourceType === 'image' ? uploadResult.secure_url : null,
      format: ext,
      resourceType,
      mimeType,
      size: fileBuffer.length,
      width: uploadResult.width,
      height: uploadResult.height,
    });

    // Cập nhật storage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: fileBuffer.length },
    });

    res.status(201).json({ success: true, message: 'Tải thành công', data: newFile });

  } catch (error) {
    console.error('Download error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Tải thất bại' });
  } finally {
    // Dọn file tạm
    if (tmpFile && fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }
};

// GET /api/download/info?url=... — lấy thông tin trước khi tải
const getUrlInfo = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, message: 'Thiếu URL' });

  try {
    if (isSocialUrl(url)) {
      const yt = await getYtDlp();
      const info = await yt.getVideoInfo(url);
      return res.json({
        success: true,
        type: 'social',
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration,
        platform: info.extractor_key,
        formats: ['video', 'mp3'],
      });
    }

    // Direct URL - lấy header
    const response = await axios.head(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const mimeType = response.headers['content-type']?.split(';')[0] || '';
    const size = parseInt(response.headers['content-length'] || 0);
    const urlPath = new URL(url).pathname;
    const fileName = path.basename(urlPath) || 'file';

    return res.json({
      success: true,
      type: 'direct',
      title: fileName,
      mimeType,
      size,
      formats: ['original'],
    });

  } catch (err) {
    res.status(400).json({ success: false, message: 'Không thể đọc thông tin URL: ' + err.message });
  }
};

// POST /api/download/to-device
const downloadToDevice = async (req, res) => {
  const { url, format = 'video' } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'Thiếu URL' });

  try {
    if (isSocialUrl(url)) {
      const yt = await getYtDlp();
      const info = await yt.getVideoInfo(url);
      const title = info.title || 'download';
      const safeTitle = title.replace(/[^\w\s-]/g, '').trim().substring(0, 80);
      
      let ext, ytFormat;
      if (format === 'mp3' || format === 'audio') {
        ext = 'mp3';
        ytFormat = ['-x', '--audio-format', 'mp3', '--audio-quality', '0'];
      } else {
        ext = 'mp4';
        ytFormat = ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', '--merge-output-format', 'mp4'];
      }

      const fileName = `${safeTitle}.${ext}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      if (ext === 'mp4') res.setHeader('Content-Type', 'video/mp4');
      else res.setHeader('Content-Type', 'audio/mpeg');
      
      // Stream trực tiếp về client
      const ytStream = yt.execStream([url, ...ytFormat, '-o', '-']);
      ytStream.pipe(res);
      
    } else {
      const response = await axios.get(url, {
        responseType: 'stream',
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      
      let fileName = 'download';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        fileName = disposition.split('filename=')[1].replace(/['"]/g, '');
      } else {
        fileName = path.basename(new URL(url).pathname) || `download_${Date.now()}`;
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
      
      response.data.pipe(res);
    }
  } catch (error) {
    console.error('Direct download error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Tải thất bại' });
  }
};

module.exports = { downloadFromUrl, getUrlInfo, downloadToDevice };
