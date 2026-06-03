import { useState, useEffect } from 'react';
import dashboardBg from '../../assets/auth-bg-dashboard.png';
import { fileService } from '../../services';
import { formatBytes, formatRelativeDate, getFileType, getFileColor } from '../../utils/helpers';
import { HardDrive, Image, Video, FileText, TrendingUp, Upload, FolderPlus, Clock } from 'lucide-react';
import FileCard from '../../components/FileCard/FileCard';
import UploadModal from '../../components/Upload/UploadModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useAuth();

  const loadStats = async () => {
    try {
      const { data } = await fileService.getStats();
      setStats(data.data);
    } catch {
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const storagePercent = stats
    ? Math.min(Math.round((stats.storageUsed / stats.storageLimit) * 100), 100)
    : 0;

  const statCards = [
    {
      label: 'Tổng file',
      value: stats?.totalFiles ?? 0,
      icon: HardDrive,
      color: '#6c63ff',
      bg: 'rgba(108, 99, 255, 0.1)',
    },
    {
      label: 'Hình ảnh',
      value: stats?.byType?.image?.count ?? 0,
      icon: Image,
      color: '#3ecfcf',
      bg: 'rgba(62, 207, 207, 0.1)',
    },
    {
      label: 'Video',
      value: stats?.byType?.video?.count ?? 0,
      icon: Video,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Tài liệu',
      value: stats?.byType?.document?.count ?? 0,
      icon: FileText,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  return (
    <div className="dashboard page-content">
      {/* Background Image */}
      <div className="dashboard-bg" style={{ backgroundImage: `url(${dashboardBg})` }} />
      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="dashboard-title">
            Chào, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="dashboard-subtitle">Đây là tổng quan lưu trữ của bạn</p>
        </div>
        <div className="dashboard-welcome-actions">
          <button className="btn btn-secondary" id="create-folder-dash-btn">
            <FolderPlus size={16} /> Tạo thư mục
          </button>
          <button className="btn btn-primary" onClick={() => setUploadOpen(true)} id="upload-dash-btn">
            <Upload size={16} /> Upload file
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card glass-card">
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

      {/* Storage + Recent */}
      <div className="dashboard-grid">
        {/* Storage Card */}
        <div className="glass-card storage-card">
          <div className="storage-card-header">
            <h3><TrendingUp size={18} /> Bộ nhớ đã dùng</h3>
          </div>
          <div className="storage-visual">
            <div className="storage-donut-wrapper">
              <svg viewBox="0 0 100 100" className="storage-donut">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${storagePercent * 2.513} 251.3`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6c63ff" />
                    <stop offset="100%" stopColor="#3ecfcf" />
                  </linearGradient>
                </defs>
                <text x="50" y="46" textAnchor="middle" fill="white" fontSize="16" fontWeight="700" fontFamily="Inter">
                  {storagePercent}%
                </text>
                <text x="50" y="60" textAnchor="middle" fill="#9ca3b8" fontSize="7" fontFamily="Inter">
                  đã dùng
                </text>
              </svg>
            </div>
            <div className="storage-breakdown">
              {[
                { label: 'Ảnh', size: stats?.byType?.image?.size || 0, color: '#3ecfcf' },
                { label: 'Video', size: stats?.byType?.video?.size || 0, color: '#f59e0b' },
                { label: 'Tài liệu', size: stats?.byType?.document?.size || 0, color: '#6c63ff' },
              ].map(item => (
                <div key={item.label} className="storage-row">
                  <div className="storage-dot" style={{ background: item.color }} />
                  <span className="storage-row-label">{item.label}</span>
                  <span className="storage-row-size">{formatBytes(item.size)}</span>
                </div>
              ))}
              <div className="storage-total">
                <span>{formatBytes(stats?.storageUsed || 0)}</span>
                <span> / {formatBytes(stats?.storageLimit || 5368709120)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Files */}
        <div className="glass-card recent-card">
          <div className="recent-header">
            <h3><Clock size={18} /> File gần đây</h3>
          </div>
          <div className="recent-files">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="recent-file-skeleton">
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton" style={{ height: 14, width: '70%' }} />
                    <div className="skeleton" style={{ height: 11, width: '40%' }} />
                  </div>
                </div>
              ))
            ) : stats?.recentFiles?.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có file nào</p>
              </div>
            ) : (
              stats?.recentFiles?.map(file => (
                <div key={file._id} className="recent-file-item">
                  <div className="recent-file-thumb">
                    {file.thumbnailUrl ? (
                      <img src={file.thumbnailUrl} alt={file.name} />
                    ) : (
                      <span style={{ color: getFileColor(getFileType(file.mimeType)) }}>📄</span>
                    )}
                  </div>
                  <div className="recent-file-info">
                    <p className="file-name">{file.name}</p>
                    <p className="file-meta">{formatBytes(file.size)} · {formatRelativeDate(file.createdAt)}</p>
                  </div>
                  <span className="recent-file-type" style={{ color: getFileColor(getFileType(file.mimeType)) }}>
                    {file.format?.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={loadStats}
      />
    </div>
  );
}
