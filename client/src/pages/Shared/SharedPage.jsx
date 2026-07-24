import { useState, useEffect } from 'react';
import { fileService } from '../../services';
import FileCard from '../../components/FileCard/FileCard';
import ShareModal from '../../components/Modal/ShareModal';
import PreviewModal from '../../components/Modal/PreviewModal';
import { Share2, FileCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function SharedPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareFile, setShareFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const { t } = useLanguage();

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await fileService.getFiles({ sort: '-createdAt' });
      setFiles(data.data.filter(f => f.isShared));
    } catch {
      toast.error(t('toast.loadFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUnshare = async (file) => {
    try {
      await fileService.revokeShare(file._id);
      toast.success(t('toast.shareRevokeSuccess'));
      setFiles(prev => prev.filter(f => f._id !== file._id));
    } catch {
      toast.error(t('toast.shareRevokeFail'));
    }
  };

  return (
    <div className="shared-page page-content">
      {/* Header */}
      <div className="files-header">
        <h1 className="files-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Share2 size={24} style={{ color: 'var(--accent-purple)' }} />
          <span>{t('shared.title')}</span>
          {!loading && (
            <span className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
              {files.length}
            </span>
          )}
        </h1>
      </div>

      {/* Intro banner */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(108, 99, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)', flexShrink: 0 }}>
          <ShieldCheck size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            Quản lý tập tin đang được chia sẻ
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Danh sách tất cả các tập tin bạn đã tạo liên kết chia sẻ công khai hoặc bảo mật. Bạn có thể thu hồi quyền bất cứ lúc nào.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="file-grid">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px' }}>
          <div className="empty-state-icon">🔗</div>
          <h3>{t('shared.emptyTitle')}</h3>
          <p>{t('shared.emptyDesc')}</p>
        </div>
      ) : (
        <div className="file-grid">
          {files.map(file => (
            <FileCard
              key={file._id}
              file={file}
              view="grid"
              onShare={setShareFile}
              onPreview={setPreviewFile}
              onDelete={() => handleUnshare(file)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() => { setShareFile(null); loadData(); }}
        />
      )}
      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          files={files}
          onNavigate={setPreviewFile}
        />
      )}
    </div>
  );
}
