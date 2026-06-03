import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Cloud, Loader, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import bgLogin from '../../assets/auth-bg-login.png.png';
import './Auth.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-page login-page"
      style={{ backgroundImage: `url(${bgLogin})` }}
    >
      {/* Overlay */}
      <div className="auth-bg-overlay" />

      {/* Floating card - LEFT */}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-top">
          <Cloud size={20} color="#ffffff" strokeWidth={1.8} />
          <span>MyClound</span>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1>
            Chào mừng trở lại<br />
            đến <span className="brand-blue">MyClound</span>
          </h1>
          <p>Đăng nhập để tiếp tục hành trình của bạn</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label">Email hoặc tên đăng nhập</label>
            <div className="auth-input-group">
              <span className="auth-input-icon"><Mail size={15} /></span>
              <input
                id="login-email"
                name="email"
                type="text"
                className="auth-input"
                placeholder="Nhập email hoặc tên đăng nhập"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label">Mật khẩu</label>
            <div className="auth-input-group">
              <span className="auth-input-icon"><Lock size={15} /></span>
              <input
                id="login-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                className="auth-input has-eye"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div className="auth-forgot">
            <a href="#">Quên mật khẩu?</a>
          </div>

          {/* Submit */}
          <button id="login-submit-btn" type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? <><Loader size={15} className="auth-spin" /> Đang đăng nhập...</> : 'Đăng nhập'}
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
              Đăng nhập với Google
            </button>
            <button type="button" className="auth-social-btn">
              <svg className="apple-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Đăng nhập với Apple
            </button>
          </div>
        </form>

        {/* Switch */}
        <p className="auth-switch" style={{ marginTop: '20px' }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
