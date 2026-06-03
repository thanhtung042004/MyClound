import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatBytes, getStoragePercent } from '../../utils/helpers';
import {
  LayoutDashboard, FolderOpen, Images, Video, FileText,
  Star, Trash2, Share2, Settings, LogOut, HardDrive, Cloud
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/files', icon: FolderOpen, label: 'Tất cả file' },
  { to: '/files?type=image', icon: Images, label: 'Hình ảnh' },
  { to: '/files?type=video', icon: Video, label: 'Video' },
  { to: '/files?type=document', icon: FileText, label: 'Tài liệu' },
];

const bottomItems = [
  { to: '/starred', icon: Star, label: 'Đã gắn sao' },
  { to: '/shared', icon: Share2, label: 'Đã chia sẻ' },
  { to: '/trash', icon: Trash2, label: 'Thùng rác' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const storagePercent = getStoragePercent(user?.storageUsed, user?.storageLimit);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Cloud size={20} />
        </div>
        <span className="logo-text">MyClound</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">Chính</p>
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

        <p className="nav-section-label" style={{ marginTop: '24px' }}>Thư viện</p>
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
          <span>Bộ nhớ</span>
        </div>
        <div className="storage-bar">
          <div
            className="storage-fill"
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
            data-tooltip="Cài đặt"
          >
            <Settings size={18} />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleLogout}
            data-tooltip="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
