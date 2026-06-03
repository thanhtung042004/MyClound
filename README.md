# MyClound

Ứng dụng lưu trữ đám mây cá nhân với React, Node.js, MongoDB và Cloudinary.

## Cấu trúc dự án

```
MyClound/
├── client/    # React + Vite frontend
└── server/    # Node.js + Express backend
```

## Cài đặt & Chạy

### 1. Cấu hình biến môi trường

**Server** (`server/.env`):
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```
VITE_API_URL=http://localhost:5000/api
```

### 2. Chạy Backend

```bash
cd server
npm install
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

### 3. Chạy Frontend

```bash
cd client
npm install
npm run dev
```

App sẽ chạy tại: http://localhost:5173

## API Endpoints

### Auth
- `POST /api/auth/register` — Đăng ký
- `POST /api/auth/login` — Đăng nhập
- `GET /api/auth/me` — Lấy thông tin user hiện tại
- `PUT /api/auth/update-profile` — Cập nhật hồ sơ
- `PUT /api/auth/change-password` — Đổi mật khẩu

### Files
- `GET /api/files` — Danh sách file
- `POST /api/files/upload` — Upload file(s)
- `PUT /api/files/:id` — Cập nhật file
- `DELETE /api/files/:id` — Xóa/chuyển vào thùng rác
- `POST /api/files/:id/share` — Tạo link chia sẻ
- `DELETE /api/files/:id/share` — Thu hồi link chia sẻ
- `GET /api/files/shared/:token` — Xem file được chia sẻ (public)
- `PUT /api/files/:id/restore` — Khôi phục từ thùng rác
- `GET /api/files/stats` — Thống kê

### Folders
- `GET /api/folders` — Danh sách thư mục
- `POST /api/folders` — Tạo thư mục
- `PUT /api/folders/:id` — Cập nhật thư mục
- `DELETE /api/folders/:id` — Xóa thư mục
- `GET /api/folders/:id/breadcrumb` — Breadcrumb path

## Tính năng

- ✅ Đăng ký / Đăng nhập (JWT)
- ✅ Upload mọi loại file (ảnh, video, tài liệu...)
- ✅ Grid & List view
- ✅ Tạo thư mục, điều hướng
- ✅ Tìm kiếm, sắp xếp, lọc
- ✅ Preview file (ảnh, video, PDF)
- ✅ Chia sẻ file với link công khai
- ✅ Thùng rác & khôi phục
- ✅ Gắn sao file yêu thích
- ✅ Dashboard thống kê
- ✅ Quản lý hồ sơ & đổi mật khẩu
- ✅ Responsive design
- ✅ Dark mode

## Tech Stack

- **Frontend**: React, Vite, React Router, Axios, Lucide Icons
- **Backend**: Node.js, Express, Mongoose, JWT, Multer
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary
