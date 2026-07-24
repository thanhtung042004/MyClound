import { useState } from 'react';
import { X, Copy, CheckCircle, Share2, Clock, Eye, Download } from 'lucide-react';
import { fileService } from '../../services';
import { copyToClipboard } from '../../utils/helpers';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import './Modal.css';

export default function ShareModal({ file, onClose }) {
  const [shareUrl, setShareUrl] = useState(file.shareToken ? `${window.location.origin}/share/${file.shareToken}` : '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState('view');
  const [expiry, setExpiry] = useState('');
  const { t } = useLanguage();

  const handleShare = async () => {
    setLoading(true);
    try {
      const { data } = await fileService.shareFile(file._id, {
        permission,
        expiresIn: expiry ? parseInt(expiry) * 3600 : null,
      });
      setShareUrl(data.shareUrl);
      toast.success(t('toast.shareCreateSuccess'));
    } catch {
      toast.error(t('toast.shareCreateFail'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      toast.success(t('toast.shareCopied'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async () => {
    try {
      await fileService.revokeShare(file._id);
      setShareUrl('');
      toast.success(t('toast.shareRevokeSuccess'));
    } catch {
      toast.error(t('toast.shareRevokeFail'));
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3><Share2 size={18} /> {t('shareModal.title')}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p className="share-filename">📄 {file.name}</p>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">{t('shareModal.permission')}</label>
            <div className="share-permission">
              <button
                className={`share-perm-btn ${permission === 'view' ? 'active' : ''}`}
                onClick={() => setPermission('view')}
              >
                <Eye size={14} /> {t('shareModal.viewOnly')}
              </button>
              <button
                className={`share-perm-btn ${permission === 'download' ? 'active' : ''}`}
                onClick={() => setPermission('download')}
              >
                <Download size={14} /> {t('shareModal.download')}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label"><Clock size={12} /> {t('shareModal.expiry')}</label>
            <input
              type="number"
              className="form-input"
              placeholder={t('shareModal.expiryPlaceholder')}
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              min="1"
            />
          </div>

          {!shareUrl ? (
            <button
              className="btn btn-primary share-create-btn"
              onClick={handleShare}
              disabled={loading}
              id="create-share-btn"
            >
              {loading ? t('shareModal.creating') : t('shareModal.createLink')}
            </button>
          ) : (
            <div className="share-url-box">
              <div className="share-url">
                <span className="share-url-text">{shareUrl}</span>
              </div>
              <div className="share-url-actions">
                <button className="btn btn-primary btn-sm" onClick={handleCopy} id="copy-share-btn">
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copied ? t('shareModal.copied') : t('shareModal.copy')}
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleRevoke}>
                  {t('shareModal.revoke')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
