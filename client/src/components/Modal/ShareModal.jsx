import { useState } from 'react';
import { X, Copy, CheckCircle, Share2, Clock, Eye, Download } from 'lucide-react';
import { fileService } from '../../services';
import { copyToClipboard } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Modal.css';

export default function ShareModal({ file, onClose }) {
  const [shareUrl, setShareUrl] = useState(file.shareToken ? `${window.location.origin}/share/${file.shareToken}` : '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState('view');
  const [expiry, setExpiry] = useState('');

  const handleShare = async () => {
    setLoading(true);
    try {
      const { data } = await fileService.shareFile(file._id, {
        permission,
        expiresIn: expiry ? parseInt(expiry) * 3600 : null,
      });
      setShareUrl(data.shareUrl);
      toast.success('Đã tạo link chia sẻ!');
    } catch {
      toast.error('Tạo link thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      toast.success('Đã sao chép!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async () => {
    try {
      await fileService.revokeShare(file._id);
      setShareUrl('');
      toast.success('Đã thu hồi link chia sẻ');
    } catch {
      toast.error('Thu hồi thất bại');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3><Share2 size={18} /> Chia sẻ file</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p className="share-filename">📄 {file.name}</p>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Quyền truy cập</label>
            <div className="share-permission">
              <button
                className={`share-perm-btn ${permission === 'view' ? 'active' : ''}`}
                onClick={() => setPermission('view')}
              >
                <Eye size={14} /> Xem
              </button>
              <button
                className={`share-perm-btn ${permission === 'download' ? 'active' : ''}`}
                onClick={() => setPermission('download')}
              >
                <Download size={14} /> Tải xuống
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label"><Clock size={12} /> Hết hạn sau (giờ, để trống = vĩnh viễn)</label>
            <input
              type="number"
              className="form-input"
              placeholder="Ví dụ: 24"
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
              {loading ? 'Đang tạo...' : 'Tạo link chia sẻ'}
            </button>
          ) : (
            <div className="share-url-box">
              <div className="share-url">
                <span className="share-url-text">{shareUrl}</span>
              </div>
              <div className="share-url-actions">
                <button className="btn btn-primary btn-sm" onClick={handleCopy} id="copy-share-btn">
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleRevoke}>
                  Thu hồi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
