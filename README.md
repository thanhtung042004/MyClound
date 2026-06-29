# MyClound 🌥️

[![Vercel Deploy](https://img.shields.io/badge/Vercel-Deploy-00C7B7?logo=vercel)](https://vercel.com)  [![Render Deploy](https://img.shields.io/badge/Render-Deploy-000?logo=render)](https://render.com)  [![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js)](https://nodejs.org)  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)

> **MyClound** – Ứng dụng lưu trữ đám mây cá nhân được xây dựng bằng **React**, **Node.js**, **MongoDB** và **Cloudinary**. Giao diện hiện đại, hỗ trợ dark mode và quản lý tệp đầy đủ, chạy trên cả desktop và mobile.

---

## 📸 Ảnh chụp màn hình

![Đăng nhập & Quên mật khẩu](file:///C:/Users/thanh/.gemini/antigravity-ide/brain/be6b7dc8-7e83-4701-9c99-f9d03a4b1e3f/media__1782695164234.png)

![Bảng điều khiển](file:///C:/Users/thanh/.gemini/antigravity-ide/brain/be6b7dc8-7e83-4701-9c99-f9d03a4b1e3f/media__1782695578618.png)

---

## 🗂️ Cấu trúc dự án

```text
MyClound/
├─ client/   # Front‑end React + Vite
├─ server/   # Back‑end Node.js + Express
└─ README.md
```

---

## ⚙️ Cài đặt & Chạy

### 1️⃣ Thiết lập biến môi trường

**Server** (`server/.env`)
```dotenv
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`)
```dotenv
VITE_API_URL=http://localhost:5000/api
```

> 👉 **Mẹo:** Giữ cả hai file này ra khỏi version control (đã có trong `.gitignore`).

### 2️⃣ Chạy Backend

```bash
cd server
npm install
npm run dev
```
API sẽ chạy tại `http://localhost:5000`.

### 3️⃣ Chạy Frontend

```bash
cd client
npm install
npm run dev
```
Ứng dụng sẽ được truy cập tại `http://localhost:5173`.

---

## 📡 Các endpoint API

### Auth
- `POST /api/auth/register` – Đăng ký tài khoản mới
- `POST /api/auth/login` – Đăng nhập, nhận JWT
- `GET /api/auth/me` – Lấy thông tin người dùng hiện tại (bảo vệ)
- `PUT /api/auth/update-profile` – Cập nhật hồ sơ (bảo vệ)
- `PUT /api/auth/change-password` – Đổi mật khẩu (bảo vệ)
- `POST /api/auth/reset-password` – **Quên mật khẩu**: gửi `{ email, newPassword }` để đặt lại mật khẩu (công khai)

### Tệp và Thư mục
*(Xem README gốc để biết toàn bộ danh sách)*

---

## ✨ Tính năng
- ✅ Đăng ký / Đăng nhập (JWT)
- ✅ **Quên mật khẩu** (đặt lại mật khẩu qua email)
- ✅ Upload mọi loại tệp (ảnh, video, tài liệu) qua Cloudinary
- ✅ Hiển thị dạng lưới & danh sách, cuộn vô hạn
- ✅ Tạo, duyệt, và breadcrumb thư mục
- ✅ Tìm kiếm, sắp xếp, lọc
- ✅ Xem trước tệp (hình ảnh, video, PDF)
- ✅ Chia sẻ tệp bằng link công khai
- ✅ Thùng rác & khôi phục
- ✅ Đánh dấu sao yêu thích
- ✅ Dashboard thống kê
- ✅ Quản lý hồ sơ & đổi mật khẩu
- ✅ Thiết kế responsive & chế độ dark mode

---

## 🛠️ Công nghệ sử dụng

- **Front‑end**: React, Vite, React Router, Axios, Lucide Icons, CSS thuần (không Tailwind)
- **Back‑end**: Node.js, Express, Mongoose, JWT, Multer
- **Cơ sở dữ liệu**: MongoDB Atlas
- **Lưu trữ tệp**: Cloudinary

---

## 🤝 Đóng góp
1. Fork repository
2. Tạo nhánh tính năng (`git checkout -b feat/ten-tinh-nang`)
3. Thực hiện thay đổi, chạy test, đảm bảo không lỗi lint
4. Gửi Pull Request kèm mô tả chi tiết

---

## 📄 Giấy phép

MIT © 2024‑2026 **Thanh Tung**
