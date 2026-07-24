import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Cloud, Loader, User, Mail, Lock, Shield, HardDrive, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t } = useLanguage();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error(t('toast.fillAll'));
      return;
    }
    if (form.password.length < 6) {
      toast.error(t('toast.passwordMin6'));
      return;
    }
    if (form.password !== form.confirm) {
      toast.error(t('toast.passwordMismatch'));
      return;
    }
    if (!agreed) {
      toast.error(t('toast.agreeTerms'));
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success(t('toast.registerSuccess'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t('toast.registerFail'));
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
        <h2>{t('auth.register.taglineTitle').split('\n').map((line, i) => (
          <span key={i}>{line}{i === 0 ? <br /> : ''}</span>
        ))}</h2>
        <p>{t('auth.register.taglineDesc').split('\n').map((line, i) => (
          <span key={i}>{line}{i === 0 ? <br /> : ''}</span>
        ))}</p>
        <div className="auth-features">
          <div className="auth-feature-item">
            <HardDrive size={20} color="#ffffff" />
            <span>{t('auth.register.featureStorage')}</span>
          </div>
          <div className="auth-feature-item">
            <Shield size={20} color="#ffffff" />
            <span>{t('auth.register.featureSecurity')}</span>
          </div>
          <div className="auth-feature-item">
            <Wifi size={20} color="#ffffff" />
            <span>{t('auth.register.featureAccess')}</span>
          </div>
        </div>
      </div>

      {/* Floating card - RIGHT */}
      <div className="auth-card">
        {/* Heading */}
        <div className="auth-heading-center">
          <h1>{t('auth.register.title')}</h1>
          <p>{t('auth.register.subtitle')}</p>
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
              placeholder={t('auth.register.namePlaceholder')}
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
              placeholder={t('auth.register.emailPlaceholder')}
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
              placeholder={t('auth.register.passwordPlaceholder')}
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
              placeholder={t('auth.register.confirmPlaceholder')}
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
            {t('auth.register.terms')} <a href="#">{t('auth.register.termsLink')}</a> {t('auth.register.termsAnd')} <a href="#">{t('auth.register.privacyLink')}</a>
          </label>

          {/* Submit */}
          <button id="register-submit-btn" type="submit" className="auth-btn-primary auth-btn-register" disabled={loading}>
            {loading ? <><Loader size={15} className="auth-spin" /> {t('auth.register.submitting')}</> : t('auth.register.submit')}
          </button>

          {/* Divider */}
          <div className="auth-divider">{t('auth.register.divider')}</div>

          {/* Social */}
          <div className="auth-social-row">
            <button type="button" className="auth-social-btn">
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('auth.register.googleBtn')}
            </button>
            <button type="button" className="auth-social-btn">
              <svg className="apple-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              {t('auth.register.appleBtn')}
            </button>
          </div>
        </form>

        <p className="auth-switch" style={{ marginTop: '18px' }}>
          {t('auth.register.hasAccount')} <Link to="/login">{t('auth.register.loginLink')}</Link>
        </p>
      </div>
    </div>
  );
}
