import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatBytes, getStoragePercent } from '../../utils/helpers';
import {
  LayoutDashboard, FolderOpen, NotebookPen, LinkIcon,
  Star, Trash2, Share2, Settings, LogOut, HardDrive, Bookmark, Languages
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const storagePercent = getStoragePercent(user?.storageUsed, user?.storageLimit);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/files', icon: FolderOpen, label: t('nav.files') },
    { to: '/notes', icon: NotebookPen, label: t('nav.notes') },
    { to: '/links', icon: Bookmark, label: t('nav.links') },
    { to: '/download', icon: LinkIcon, label: t('nav.download') },
    { to: '/translate', icon: Languages, label: t('nav.translate') },
  ];

  const bottomItems = [
    { to: '/starred', icon: Star, label: t('nav.starred') },
    { to: '/shared', icon: Share2, label: t('nav.shared') },
    { to: '/trash', icon: Trash2, label: t('nav.trash') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <img src="/Gemini_Generated_Image_ug8lf4ug8lf4ug8l.jpg" alt="MyClound" className="logo-img" />
        </div>
        <span className="logo-text">MyClound</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">{t('nav.main')}</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        <p className="nav-section-label" style={{ marginTop: '24px' }}>{t('nav.library')}</p>
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Storage */}
      <div className="sidebar-storage">
        <div className="storage-header">
          <HardDrive size={16} />
          <span>{t('storage.label')}</span>
        </div>
        <div className="storage-bar">
          <div
            className={`storage-fill ${storagePercent >= 95 ? 'danger' : storagePercent >= 80 ? 'warning' : ''}`}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <div className="storage-info">
          <span>{formatBytes(user?.storageUsed || 0)}</span>
          <span>/ {formatBytes(user?.storageLimit || 5368709120)}</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => navigate('/settings')}>
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        <div className="sidebar-actions">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => navigate('/settings')}
            data-tooltip={t('nav.settings')}
          >
            <Settings size={18} />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleLogout}
            data-tooltip={t('nav.logout')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
