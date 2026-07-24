import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services';
import { User, Lock, Camera, Palette, Sun, Moon, Languages, ChevronDown, ShieldCheck, HelpCircle } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [name, setName] = useState(user?.name || '');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  // Security question state
  const [securityQuestion, setSecurityQuestion] = useState(user?.securityQuestion || '');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [savingSecQ, setSavingSecQ] = useState(false);

  const SECURITY_QUESTIONS = [
    'Tên thú cưng đầu tiên của bạn là gì?',
    'Trường tiểu học bạn đã học là gì?',
    'Tên thành phố sinh ra của bạn?',
    'Tên người bạn thân nhất thời thơ ấu?',
    'Món ăn yêu thích của bạn là gì?',
    'Tên đường bạn lớn lên?',
    'Nghề nghiệp của bố bạn?',
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authService.updateProfile({ name });
      updateUser(data.user);
      toast.success(t('toast.profileUpdateSuccess'));
    } catch {
      toast.error(t('toast.profileUpdateFail'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { toast.error(t('toast.passwordMismatch')); return; }
    if (newPwd.length < 6) { toast.error(t('toast.passwordTooShort')); return; }
    setChangingPwd(true);
    try {
      await authService.changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      toast.success(t('toast.passwordChangeSuccess'));
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      toast.error(err.response?.data?.message || t('toast.profileUpdateFail'));
    } finally {
      setChangingPwd(false);
    }
  };

  const handleSaveSecurityQuestion = async (e) => {
    e.preventDefault();
    if (!securityQuestion || !securityAnswer.trim()) {
      toast.error('Vui lòng chọn câu hỏi và nhập câu trả lời.');
      return;
    }
    setSavingSecQ(true);
    try {
      await authService.updateSecurityQuestion({ securityQuestion, securityAnswer });
      toast.success('Câu hỏi bí mật đã được cập nhật!');
      setSecurityAnswer('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật câu hỏi bí mật.');
    } finally {
      setSavingSecQ(false);
    }
  };

  return (
    <div className="settings-page page-content">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 32 }}>{t('settings.title')}</h1>

      <div className="settings-grid">
        {/* Profile */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <User size={18} />
            <h2>{t('settings.profile')}</h2>
          </div>

          {/* Avatar */}
          <div className="avatar-section">
            <div className="settings-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase()}</span>
              )}
              <div className="avatar-overlay">
                <Camera size={16} />
              </div>
            </div>
            <div>
              <p className="settings-name">{user?.name}</p>
              <p className="settings-email">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group">
              <label className="form-label">{t('settings.fullName')}</label>
              <input
                id="settings-name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('settings.namePlaceholder')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.email')}</label>
              <input
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            <button
              id="save-profile-btn"
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? t('settings.saving') : t('settings.save')}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <Lock size={18} />
            <h2>{t('settings.changePassword')}</h2>
          </div>

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label className="form-label">{t('settings.currentPassword')}</label>
              <input
                id="current-password"
                type="password"
                className="form-input"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder={t('settings.currentPwdPlaceholder')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.newPassword')}</label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder={t('settings.newPwdPlaceholder')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.confirmPassword')}</label>
              <input
                id="confirm-new-password"
                type="password"
                className="form-input"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder={t('settings.confirmPwdPlaceholder')}
              />
            </div>
            <button
              id="change-password-btn"
              type="submit"
              className="btn btn-primary"
              disabled={changingPwd || !currentPwd || !newPwd || !confirmPwd}
            >
              {changingPwd ? t('settings.changingBtn') : t('settings.changeBtn')}
            </button>
          </form>
        </div>

        {/* Security Question */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <ShieldCheck size={18} />
            <h2>Câu hỏi bí mật</h2>
          </div>

          {user?.securityQuestion && (
            <div className="settings-security-current">
              <HelpCircle size={14} />
              <span>Hiện tại: <em>{user.securityQuestion}</em></span>
            </div>
          )}

          <p className="settings-security-desc">
            Dùng để xác minh danh tính khi quên mật khẩu. Câu trả lời không phân biệt chữ hoa/thường.
          </p>

          <form onSubmit={handleSaveSecurityQuestion} className="settings-form">
            <div className="form-group">
              <label className="form-label">Chọn câu hỏi bí mật</label>
              <select
                id="security-question-select"
                className="form-input"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
              >
                <option value="">-- Chọn câu hỏi --</option>
                {SECURITY_QUESTIONS.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Câu trả lời</label>
              <input
                id="security-answer"
                type="text"
                className="form-input"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Nhập câu trả lời bí mật..."
                autoComplete="off"
              />
            </div>
            <button
              id="save-security-question-btn"
              type="submit"
              className="btn btn-primary"
              disabled={savingSecQ || !securityQuestion || !securityAnswer.trim()}
            >
              {savingSecQ ? 'Đang lưu...' : 'Lưu câu hỏi bí mật'}
            </button>
          </form>
        </div>

        {/* Appearance + Language */}
        <div className="settings-card glass-card settings-card-full">
          <div className="settings-card-header">
            <Palette size={18} />
            <h2>{t('settings.appearance')}</h2>
          </div>

          <p className="settings-appearance-desc">{t('settings.appearanceDesc')}</p>

          <div className="theme-options">
            <button
              id="theme-dark-btn"
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <div className="theme-preview theme-preview-dark">
                <div className="tp-sidebar" />
                <div className="tp-content">
                  <div className="tp-bar" />
                  <div className="tp-bar tp-bar-short" />
                </div>
              </div>
              <div className="theme-option-label">
                <Moon size={15} />
                <span>{t('settings.dark')}</span>
              </div>
              {theme === 'dark' && <div className="theme-active-dot" />}
            </button>

            <button
              id="theme-light-btn"
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <div className="theme-preview theme-preview-light">
                <div className="tp-sidebar" />
                <div className="tp-content">
                  <div className="tp-bar" />
                  <div className="tp-bar tp-bar-short" />
                </div>
              </div>
              <div className="theme-option-label">
                <Sun size={15} />
                <span>{t('settings.light')}</span>
              </div>
              {theme === 'light' && <div className="theme-active-dot" />}
            </button>
          </div>

          {/* Language row */}
          <div className="lang-row">
            <div className="lang-row-label">
              <Languages size={16} />
              <span>{t('settings.language')}</span>
            </div>
            <div className="lang-select-wrap">
              <span className="lang-select-flag">
                {LANGUAGES.find(l => l.code === language)?.flag}
              </span>
              <select
                id="language-select"
                className="lang-select"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeLabel} — {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="lang-select-chevron" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
