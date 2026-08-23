const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,          // Tối đa 10 connections song song
      minPoolSize: 2,           // Giữ ít nhất 2 connections sẵn sàng
      waitQueueTimeoutMS: 5000, // Timeout khi chờ connection từ pool
      family: 4,                // Bắt buộc dùng IPv4, tránh lỗi DNS lookup chậm
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Xử lý disconnect bất ngờ
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected.');
    });
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('Could not connect to MongoDB after multiple attempts.');
      // Không exit để server vẫn chạy và trả về lỗi rõ ràng
    }
  }
};

module.exports = connectDB;
