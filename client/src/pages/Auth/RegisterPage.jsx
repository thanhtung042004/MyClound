import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Cloud, Loader, User, Mail, Lock, Shield, HardDrive, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import bgRegister from '../../assets/auth-bg-register.png.png';
import './Auth.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Mật khẩu phải ít nhất 6 ký tự');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!agreed) {
      toast.error('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Đăng ký thành công! Chào mừng bạn!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-page register-page"
      style={{ backgroundImage: `url(${bgRegister})` }}
    >
      {/* Overlay */}
      <div className="auth-bg-overlay" />

      {/* Logo - top left of page (outside card) */}
      <div className="auth-page-logo">
        <Cloud size={20} color="#ffffff" strokeWidth={1.8} />
        <span>MyClound</span>
      </div>

      {/* Tagline - bottom left of page */}
      <div className="auth-left-tagline">
        <h2>Lưu trữ tối giản<br />Kết nối vô hạn</h2>
        <p>MyClound – Không gian lưu trữ đám mây<br />an toàn, bảo mật và luôn bên bạn.</p>
        <div className="auth-features">
          <div className="auth-feature-item">
            <HardDrive size={20} color="#ffffff" />
            <span>Lưu trữ an toàn</span>
          </div>
          <div className="auth-feature-item">
            <Shield size={20} color="#ffffff" />
            <span>Bảo mật tuyệt đối</span>
          </div>
          <div className="auth-feature-item">
            <Wifi size={20} color="#ffffff" />
            <span>Truy cập mọi lúc</span>
          </div>
        </div>
      </div>

      {/* Floating card - RIGHT */}
      <div className="auth-card">
        {/* Heading */}
        <div className="auth-heading-center">
          <h1>Tạo tài khoản MyClound</h1>
          <p>Bắt đầu hành trình lưu trữ của bạn</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name */}
          <div className="auth-input-group">
            <span className="auth-input-icon"><User size={15} /></span>
            <input
              id="register-name"
              name="name"
              type="text"
              className="auth-input"
              placeholder="Họ và tên"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="auth-input-group">
            <span className="auth-input-icon"><Mail size={15} /></span>
            <input
              id="register-email"
              name="email"
              type="email"
              className="auth-input"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <span className="auth-input-icon"><Lock size={15} /></span>
            <input
              id="register-password"
              name="password"
              type={showPass ? 'text' : 'password'}
              className="auth-input has-eye"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
            />
            <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Confirm */}
          <div className="auth-input-group">
            <span className="auth-input-icon"><Lock size={15} /></span>
            <input
              id="register-confirm"
              name="confirm"
              type={showConfirm ? 'text' : 'password'}
              className="auth-input has-eye"
              placeholder="Xác nhận mật khẩu"
              value={form.confirm}
              onChange={handleChange}
            />
            <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Terms */}
          <label className="auth-terms">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} id="register-terms" />
            Tôi đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a>
          </label>

          {/* Submit */}
          <button id="register-submit-btn" type="submit" className="auth-btn-primary auth-btn-register" disabled={loading}>
            {loading ? <><Loader size={15} className="auth-spin" /> Đang tạo tài khoản...</> : 'Đăng ký'}
          </button>

          {/* Divider */}
          <div className="auth-divider">hoặc</div>

          {/* Social */}
          <div className="auth-social-row">
            <button type="button" className="auth-social-btn">
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Đăng ký với Google
            </button>
            <button type="button" className="auth-social-btn">
              <svg className="apple-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Đăng ký với Apple
            </button>
          </div>
        </form>

        <p className="auth-switch" style={{ marginTop: '18px' }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
