import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardBg from '../../assets/auth-bg-dashboard.png';
import { fileService } from '../../services';
import { formatBytes, formatRelativeDate, getFileType, getFileColor, getFileIcon } from '../../utils/helpers';
import {
  HardDrive, Image, Video, FileText, TrendingUp, Clock,
  Upload, FolderPlus, NotebookPen, ArrowRight, Zap,
  Activity
} from 'lucide-react';
import UploadModal from '../../components/Upload/UploadModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const loadStats = async () => {
    try {
      const { data } = await fileService.getStats();
      setStats(data.data);
    } catch {
      toast.error(t('toast.loadStatsFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const storagePercent = stats
    ? Math.min(parseFloat(((stats.storageUsed / stats.storageLimit) * 100).toFixed(1)), 100)
    : 0;
  // Visual arc: show at least 2% if there's any data so the arc is always visible
  const arcPercent = storagePercent > 0 ? Math.max(storagePercent, 2) : 0;

  const statCards = [
    {
      label: t('dashboard.totalFiles'),
      value: stats?.totalFiles ?? 0,
      icon: HardDrive,
      color: '#6c63ff',
      bg: 'rgba(108, 99, 255, 0.12)',
      gradient: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(108,99,255,0.05))',
    },
    {
      label: t('dashboard.images'),
      value: stats?.byType?.image?.count ?? 0,
      icon: Image,
      color: '#3ecfcf',
      bg: 'rgba(62, 207, 207, 0.12)',
      gradient: 'linear-gradient(135deg, rgba(62,207,207,0.15), rgba(62,207,207,0.05))',
    },
    {
      label: t('dashboard.video'),
      value: stats?.byType?.video?.count ?? 0,
      icon: Video,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    },
    {
      label: t('dashboard.documents'),
      value: stats?.byType?.document?.count ?? 0,
      icon: FileText,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
    },
  ];

  const quickActions = [
    {
      icon: Upload,
      label: 'Tải lên',
      desc: 'Upload file mới',
      color: '#6c63ff',
      bg: 'rgba(108,99,255,0.12)',
      onClick: () => setShowUpload(true),
      id: 'dashboard-upload-btn',
    },
    {
      icon: FolderPlus,
      label: 'Tạo thư mục',
      desc: 'Tổ chức tài liệu',
      color: '#3ecfcf',
      bg: 'rgba(62,207,207,0.12)',
      onClick: () => navigate('/files'),
      id: 'dashboard-folder-btn',
    },
    {
      icon: NotebookPen,
      label: 'Ghi chú mới',
      desc: 'Tạo note nhanh',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
      onClick: () => navigate('/notes'),
      id: 'dashboard-note-btn',
    },
  ];

  const storageByType = [
    { label: t('dashboard.photo'), size: stats?.byType?.image?.size || 0, color: '#3ecfcf', percent: stats ? (stats.byType?.image?.size / (stats.storageLimit || 1)) * 100 : 0 },
    { label: t('dashboard.video'), size: stats?.byType?.video?.size || 0, color: '#f59e0b', percent: stats ? (stats.byType?.video?.size / (stats.storageLimit || 1)) * 100 : 0 },
    { label: t('dashboard.documents'), size: stats?.byType?.document?.size || 0, color: '#6c63ff', percent: stats ? (stats.byType?.document?.size / (stats.storageLimit || 1)) * 100 : 0 },
  ];

  return (
    <div className="dashboard page-content">
      {/* Background Image */}
      <div className="dashboard-bg" style={{ backgroundImage: `url(${dashboardBg})` }} />

      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="dashboard-title">
            {t('dashboard.welcome')} <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="dashboard-subtitle">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card glass-card" style={{ '--card-gradient': card.gradient }}>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon size={22} />
            </div>
            <div className="stat-info">
              <p className="stat-label">{card.label}</p>
              <p className="stat-value">
                {loading ? <span className="skeleton" style={{ width: 40, height: 24, display: 'inline-block' }} /> : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-quick-actions">
        <div className="section-header">
          <span className="section-header-icon"><Zap size={16} /></span>
          <h2 className="section-title">Thao tác nhanh</h2>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.label}
              id={action.id}
              className="quick-action-card glass-card"
              onClick={action.onClick}
            >
              <div className="quick-action-icon" style={{ background: action.bg, color: action.color }}>
                <action.icon size={20} />
              </div>
              <div className="quick-action-info">
                <p className="quick-action-label">{action.label}</p>
                <p className="quick-action-desc">{action.desc}</p>
              </div>
              <ArrowRight size={14} className="quick-action-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Storage + Recent Files */}
      <div className="dashboard-grid">
        {/* Storage Card */}
        <div className="glass-card storage-card">
          <div className="storage-card-header">
            <h3><TrendingUp size={18} /> {t('dashboard.storageUsed')}</h3>
          </div>

          {/* Donut */}
          <div className="storage-visual">
            <div className="storage-donut-wrapper">
              <svg viewBox="0 0 100 100" className="storage-donut">
                <circle cx="50" cy="50" r="40" fill="none" className="donut-track" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${arcPercent * 2.513} 251.3`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6c63ff" />
                    <stop offset="100%" stopColor="#3ecfcf" />
                  </linearGradient>
                </defs>
                <text x="50" y="46" textAnchor="middle" className="donut-text-main" fontSize="14" fontWeight="700" fontFamily="Inter">
                  {storagePercent}%
                </text>
                <text x="50" y="60" textAnchor="middle" className="donut-text-sub" fontSize="7" fontFamily="Inter">
                  {t('dashboard.used')}
                </text>
              </svg>
            </div>
            <div className="storage-breakdown">
              {storageByType.map(item => (
                <div key={item.label} className="storage-row">
                  <div className="storage-dot" style={{ background: item.color }} />
                  <span className="storage-row-label">{item.label}</span>
                  <span className="storage-row-size">{formatBytes(item.size)}</span>
                </div>
              ))}
              <div className="storage-total">
                <span>{formatBytes(stats?.storageUsed || 0)}</span>
                <span>/ {formatBytes(stats?.storageLimit || 26843545600)}</span>
              </div>

              {/* Storage warning */}
              {storagePercent >= 80 && (
                <div className="storage-warning">
                  ⚠️ Sắp đầy! Còn {formatBytes((stats?.storageLimit || 0) - (stats?.storageUsed || 0))} trống.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Files */}
        <div className="glass-card recent-card">
          <div className="recent-header">
            <h3><Clock size={18} /> {t('dashboard.recentFiles')}</h3>
            <button className="recent-view-all" onClick={() => navigate('/files')}>
              Xem tất cả <ArrowRight size={13} />
            </button>
          </div>
          <div className="recent-files">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="recent-file-skeleton">
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton" style={{ height: 14, width: '70%' }} />
                    <div className="skeleton" style={{ height: 11, width: '40%' }} />
                  </div>
                </div>
              ))
            ) : stats?.recentFiles?.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <span className="empty-state-icon">📂</span>
                <p>{t('dashboard.noFiles')}</p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
                  <Upload size={14} /> Upload ngay
                </button>
              </div>
            ) : (
              stats?.recentFiles?.map(file => {
                const fileType = getFileType(file.mimeType);
                const fileColor = getFileColor(fileType);
                const fileIcon = getFileIcon(fileType);
                return (
                  <div key={file._id} className="recent-file-item" onClick={() => navigate('/files')}>
                    <div className="recent-file-thumb" style={{ background: `${fileColor}18` }}>
                      {file.thumbnailUrl ? (
                        <img src={file.thumbnailUrl} alt={file.name} />
                      ) : (
                        <span style={{ fontSize: '1.1rem' }}>{fileIcon}</span>
                      )}
                    </div>
                    <div className="recent-file-info">
                      <p className="file-name">{file.name}</p>
                      <p className="file-meta">{formatBytes(file.size)} · {formatRelativeDate(file.createdAt)}</p>
                    </div>
                    <span className="recent-file-badge" style={{ color: fileColor, background: `${fileColor}18` }}>
                      {file.format?.toUpperCase() || fileType}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Suggestion tip khi chưa có file */}
      {!loading && stats?.totalFiles === 0 && (
        <div className="dashboard-tip glass-card">
          <div className="tip-icon"><Activity size={20} /></div>
          <div className="tip-content">
            <p className="tip-title">Bắt đầu sử dụng MyCloud</p>
            <p className="tip-desc">Upload file đầu tiên của bạn, tạo ghi chú, hoặc lưu link quan trọng. Tất cả được lưu trữ an toàn trên cloud.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
            <Upload size={14} /> Upload ngay
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => { setShowUpload(false); loadStats(); }}
      />
    </div>
  );
}
