import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Cloud, Loader, Mail, Lock, ArrowLeft, KeyRound, ShieldCheck, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services';
import { useLanguage } from '../../context/LanguageContext';
import bgLogin from '../../assets/auth-bg-login.png.png';
import './Auth.css';

export default function LoginPage() {
  const [view, setView] = useState('login'); // 'login' | 'forgot-step1' | 'forgot-step2'

  // Login state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Forgot password — step 1: find account
  const [forgotEmail, setForgotEmail] = useState('');
  const [step1Loading, setStep1Loading] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');

  // Forgot password — step 2: verify answer + new password
  const [forgotForm, setForgotForm] = useState({ securityAnswer: '', newPassword: '', confirmPassword: '' });
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  /* ───── LOGIN ───── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error(t('toast.fillAll'));
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success(t('toast.loginSuccess'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t('toast.loginFail'));
    } finally {
      setLoginLoading(false);
    }
  };

  /* ───── FORGOT STEP 1: Tìm câu hỏi bí mật theo email ───── */
  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error(t('toast.fillAll'));
      return;
    }
    setStep1Loading(true);
    try {
      const res = await authService.getSecurityQuestion({ email: forgotEmail.trim() });
      setSecurityQuestion(res.data.securityQuestion);
      setForgotForm({ securityAnswer: '', newPassword: '', confirmPassword: '' });
      setView('forgot-step2');
    } catch (err) {
      const msg = err.response?.data?.message || t('toast.resetPasswordFail');
      if (err.response?.data?.noSecurityQuestion) {
        toast.error('Tài khoản này chưa thiết lập câu hỏi bí mật. Vào Settings → Bảo mật để thiết lập.');
      } else {
        toast.error(msg);
      }
    } finally {
      setStep1Loading(false);
    }
  };

  /* ───── FORGOT STEP 2: Xác minh câu trả lời + đặt mật khẩu mới ───── */
  const handleForgotStep2 = async (e) => {
    e.preventDefault();
    const { securityAnswer, newPassword, confirmPassword } = forgotForm;

    if (!securityAnswer || !newPassword || !confirmPassword) {
      toast.error(t('toast.fillAll'));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t('toast.passwordMin6Forgot'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('toast.passwordMismatch'));
      return;
    }

    setForgotLoading(true);
    try {
      await authService.resetPassword({
        email: forgotEmail.trim(),
        securityAnswer,
        newPassword,
      });
      toast.success(t('toast.resetPasswordSuccess'));
      setForgotEmail('');
      setForgotForm({ securityAnswer: '', newPassword: '', confirmPassword: '' });
      setSecurityQuestion('');
      setView('login');
    } catch (err) {
      toast.error(err.response?.data?.message || t('toast.resetPasswordFail'));
    } finally {
      setForgotLoading(false);
    }
  };

  const switchToForgot = () => {
    setForgotEmail(loginForm.email);
    setView('forgot-step1');
  };

  const backToLogin = () => {
    setView('login');
    setSecurityQuestion('');
    setForgotForm({ securityAnswer: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div
      className="auth-page login-page"
      style={{ backgroundImage: `url(${bgLogin})` }}
    >
      {/* Overlay */}
      <div className="auth-bg-overlay" />

      {/* Card */}
      <div className="auth-card forgot-card-wrap">

        {/* ═══ VIEW: LOGIN ═══ */}
        <div className={`forgot-view ${view === 'login' ? 'forgot-view--active' : 'forgot-view--hidden forgot-view--out'}`}>
          {/* Logo */}
          <div className="auth-logo-top">
            <Cloud size={20} color="#ffffff" strokeWidth={1.8} />
            <span>MyCloud</span>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <h1>
              {t('auth.login.title')}<br />
              {t('auth.login.titleSub')} <span className="brand-blue">MyCloud</span>
            </h1>
            <p>{t('auth.login.subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="auth-form">
            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">{t('auth.login.emailLabel')}</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><Mail size={15} /></span>
                <input
                  id="login-email"
                  name="email"
                  type="text"
                  className="auth-input"
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">{t('auth.login.passwordLabel')}</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><Lock size={15} /></span>
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="auth-input has-eye"
                  placeholder={t('auth.login.passwordPlaceholder')}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Forgot link */}
            <div className="auth-forgot">
              <button type="button" className="forgot-link-btn" onClick={switchToForgot}>
                {t('auth.login.forgotPassword')}
              </button>
            </div>

            {/* Submit */}
            <button id="login-submit-btn" type="submit" className="auth-btn-primary" disabled={loginLoading}>
              {loginLoading ? <><Loader size={15} className="auth-spin" /> {t('auth.login.submitting')}</> : t('auth.login.submit')}
            </button>
          </form>

          {/* Switch */}
          <p className="auth-switch" style={{ marginTop: '20px' }}>
            {t('auth.login.noAccount')} <Link to="/register">{t('auth.login.registerLink')}</Link>
          </p>
        </div>

        {/* ═══ VIEW: FORGOT STEP 1 — Nhập email ═══ */}
        <div className={`forgot-view ${view === 'forgot-step1' ? 'forgot-view--active' : 'forgot-view--hidden forgot-view--in'}`}>
          {/* Logo */}
          <div className="auth-logo-top">
            <Cloud size={20} color="#ffffff" strokeWidth={1.8} />
            <span>MyCloud</span>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <div className="forgot-icon-wrap">
              <KeyRound size={28} color="#5b8dee" strokeWidth={1.6} />
            </div>
            <h1>{t('auth.forgot.title')}<br /><span className="brand-blue">{t('auth.forgot.titleSub')}</span></h1>
            <p>Nhập email tài khoản để lấy câu hỏi bí mật.</p>
          </div>

          {/* Step indicator */}
          <div className="forgot-steps">
            <div className="forgot-step active"><span>1</span><p>Email</p></div>
            <div className="forgot-step-line" />
            <div className="forgot-step"><span>2</span><p>Xác minh</p></div>
          </div>

          {/* Form */}
          <form onSubmit={handleForgotStep1} className="auth-form" style={{ marginTop: '16px' }}>
            <div className="auth-field">
              <label className="auth-label">{t('auth.forgot.emailLabel')}</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><Mail size={15} /></span>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder={t('auth.forgot.emailPlaceholder')}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <button id="forgot-step1-btn" type="submit" className="auth-btn-primary" disabled={step1Loading}>
              {step1Loading ? <><Loader size={15} className="auth-spin" /> Đang tìm...</> : 'Tiếp tục'}
            </button>
          </form>

          <button type="button" className="forgot-back-btn" onClick={backToLogin}>
            <ArrowLeft size={14} />
            {t('auth.forgot.back')}
          </button>
        </div>

        {/* ═══ VIEW: FORGOT STEP 2 — Câu trả lời bí mật + mật khẩu mới ═══ */}
        <div className={`forgot-view ${view === 'forgot-step2' ? 'forgot-view--active' : 'forgot-view--hidden forgot-view--in'}`}>
          {/* Logo */}
          <div className="auth-logo-top">
            <Cloud size={20} color="#ffffff" strokeWidth={1.8} />
            <span>MyCloud</span>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <div className="forgot-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
              <ShieldCheck size={28} color="#10b981" strokeWidth={1.6} />
            </div>
            <h1>Xác minh danh tính</h1>
            <p>Trả lời câu hỏi bí mật để đặt lại mật khẩu.</p>
          </div>

          {/* Step indicator */}
          <div className="forgot-steps">
            <div className="forgot-step done"><span>✓</span><p>Email</p></div>
            <div className="forgot-step-line active" />
            <div className="forgot-step active"><span>2</span><p>Xác minh</p></div>
          </div>

          {/* Form */}
          <form onSubmit={handleForgotStep2} className="auth-form" style={{ marginTop: '16px' }}>
            {/* Security question display */}
            {securityQuestion && (
              <div className="auth-security-question-display">
                <HelpCircle size={14} />
                <span>{securityQuestion}</span>
              </div>
            )}

            {/* Security answer */}
            <div className="auth-field">
              <label className="auth-label">Câu trả lời bí mật</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><ShieldCheck size={15} /></span>
                <input
                  id="forgot-security-answer"
                  name="securityAnswer"
                  type="text"
                  className="auth-input"
                  placeholder="Nhập câu trả lời..."
                  value={forgotForm.securityAnswer}
                  onChange={(e) => setForgotForm({ ...forgotForm, securityAnswer: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="auth-field">
              <label className="auth-label">{t('auth.forgot.newPasswordLabel')}</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><Lock size={15} /></span>
                <input
                  id="forgot-newpassword"
                  name="newPassword"
                  type={showNewPass ? 'text' : 'password'}
                  className="auth-input has-eye"
                  placeholder={t('auth.forgot.newPasswordPlaceholder')}
                  value={forgotForm.newPassword}
                  onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowNewPass(!showNewPass)} tabIndex={-1}>
                  {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label className="auth-label">{t('auth.forgot.confirmLabel')}</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><Lock size={15} /></span>
                <input
                  id="forgot-confirmpassword"
                  name="confirmPassword"
                  type={showConfirmPass ? 'text' : 'password'}
                  className="auth-input has-eye"
                  placeholder={t('auth.forgot.confirmPlaceholder')}
                  value={forgotForm.confirmPassword}
                  onChange={(e) => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowConfirmPass(!showConfirmPass)} tabIndex={-1}>
                  {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Strength hint */}
            {forgotForm.newPassword && (
              <div className="forgot-strength">
                <div className={`forgot-strength-bar ${
                  forgotForm.newPassword.length >= 10 ? 'strong'
                  : forgotForm.newPassword.length >= 6 ? 'medium'
                  : 'weak'
                }`} />
                <span className="forgot-strength-label">
                  {forgotForm.newPassword.length >= 10 ? t('auth.forgot.strengthStrong') : forgotForm.newPassword.length >= 6 ? t('auth.forgot.strengthMedium') : t('auth.forgot.strengthWeak')}
                </span>
              </div>
            )}

            {/* Submit */}
            <button id="forgot-submit-btn" type="submit" className="auth-btn-primary" disabled={forgotLoading}>
              {forgotLoading ? <><Loader size={15} className="auth-spin" /> {t('auth.forgot.submitting')}</> : t('auth.forgot.submit')}
            </button>
          </form>

          <button type="button" className="forgot-back-btn" onClick={() => setView('forgot-step1')}>
            <ArrowLeft size={14} />
            Quay lại bước trước
          </button>
        </div>

      </div>
    </div>
  );
}
