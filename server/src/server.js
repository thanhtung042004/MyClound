require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');
const folderRoutes = require('./routes/folder.routes');
const downloadRoutes = require('./routes/download.routes');

const app = express();

// Connect to MongoDB
connectDB();

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://my-cloud.vercel.app',
  'https://my-clound.vercel.app',
  'https://my-clound-git-main-thanhtung042004s-projects.vercel.app',
  process.env.CLIENT_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MyClound Backend API is running ',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/download', downloadRoutes);

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