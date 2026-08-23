require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');
const folderRoutes = require('./routes/folder.routes');
const downloadRoutes = require('./routes/download.routes');
const noteRoutes = require('./routes/note.routes');
const linkRoutes = require('./routes/link.routes');
const translateRoutes = require('./routes/translate.routes');

const app = express();

// Connect to MongoDB
connectDB();

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://my-cloud.vercel.app',
  'https://my-clound.vercel.app',
  'https://my-clound-git-main-thanhtung042004s-projects.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean).map(o => o.replace(/\/$/, '')); // Lọc undefined và bỏ dấu / cuối

const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép request không có origin (mobile app, Postman, curl...)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    // Kiểm tra whitelist cố định
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // Cho phép tất cả subdomain của vercel.app (preview deployments)
    if (/^https:\/\/[\w-]+-[\w-]+-thanhtung042004s-projects\.vercel\.app$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    console.log('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Xử lý preflight OPTIONS cho tất cả routes
app.options('*', cors(corsOptions));

// Rate limiting — chặn brute force login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 30,                   // Tối đa 30 requests/15 phút/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.' },
});

// Middleware
// Giảm từ 50mb xuống 10mb — upload file dùng multipart, không cần JSON lớn
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Chỉ log request khi có lỗi (status >= 400), bỏ qua các request thành công
app.use(morgan('dev', {
  skip: (req, res) => res.statusCode < 400,
}));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MyClound Backend API is running ',
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/translate', translateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'MyClound API is running ' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MyClound Server running on port ${PORT}`);
});

module.exports = app;