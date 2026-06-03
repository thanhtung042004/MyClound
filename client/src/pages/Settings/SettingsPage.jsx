import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services';
import { User, Lock, Camera, Palette, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authService.updateProfile({ name });
      updateUser(data.user);
      toast.success('Đã cập nhật hồ sơ');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    if (newPwd.length < 6) { toast.error('Mật khẩu mới phải ít nhất 6 ký tự'); return; }
    setChangingPwd(true);
    try {
      await authService.changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      toast.success('Đã đổi mật khẩu thành công');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="settings-page page-content">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 32 }}>Cài đặt</h1>

      <div className="settings-grid">
        {/* Profile */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <User size={18} />
            <h2>Hồ sơ cá nhân</h2>
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
              <label className="form-label">Họ và tên</label>
              <input
                id="settings-name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên của bạn"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
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
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <Lock size={18} />
            <h2>Đổi mật khẩu</h2>
          </div>

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label className="form-label">Mật khẩu hiện tại</label>
              <input
                id="current-password"
                type="password"
                className="form-input"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input
                id="confirm-new-password"
                type="password"
                className="form-input"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <button
              id="change-password-btn"
              type="submit"
              className="btn btn-primary"
              disabled={changingPwd || !currentPwd || !newPwd || !confirmPwd}
            >
              {changingPwd ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>

        {/* Appearance */}
        <div className="settings-card glass-card settings-card-full">
          <div className="settings-card-header">
            <Palette size={18} />
            <h2>Giao diện</h2>
          </div>

          <p className="settings-appearance-desc">Chọn chủ đề hiển thị cho ứng dụng</p>

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
                <span>Tối</span>
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
                <span>Sáng</span>
              </div>
              {theme === 'light' && <div className="theme-active-dot" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
