import { useState } from 'react';
import { Link, X, CheckCircle, AlertCircle, File, DownloadCloud, Download as DownloadIcon, Image as ImageIcon, Video, Music } from 'lucide-react';
import { downloadService } from '../../services';
import toast from 'react-hot-toast';
import './UrlUploadModal.css';

export default function UrlUploadModal({ isOpen, onClose, onSuccess }) {
  const [url, setUrl] = useState('');
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [urlInfo, setUrlInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('video');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setUrl('');
    setUrlInfo(null);
    setSelectedFormat('video');
    setError('');
    onClose();
  };

  const handleCheckUrl = async () => {
    if (!url.trim()) return;
    setIsLoadingInfo(true);
    setError('');
    try {
      const { data } = await downloadService.getUrlInfo(url);
      setUrlInfo(data);
      if (data.formats?.length) {
        setSelectedFormat(data.formats[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể kiểm tra URL này. Bạn vẫn có thể thử tải xuống trực tiếp.');
      setUrlInfo({ type: 'unknown', formats: ['original'] });
      setSelectedFormat('original');
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) return;
    setIsDownloading(true);
    setError('');
    
    // Toast notification for background process
    const toastId = toast.loading('Đang tải file từ URL...');
    
    try {
      const { data } = await downloadService.downloadFromUrl({
        url,
        format: selectedFormat
      });
      toast.success('Đã tải file thành công!', { id: toastId });
      if (onSuccess) onSuccess(data.data);
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Tải file thất bại';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadToDevice = async () => {
    if (!url.trim()) return;
    setIsDownloading(true);
    setError('');
    const toastId = toast.loading('Đang tải file về máy...');
    
    try {
      const response = await downloadService.downloadToDevice({ url, format: selectedFormat });
      
      // Tạo URL tải xuống từ Blob
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Lấy tên file từ header Content-Disposition
      let filename = `download_${Date.now()}`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/['"]/g, '');
      }
      
      // Tự động kích hoạt download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', decodeURIComponent(filename));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Đã tải xong!', { id: toastId });
      handleClose();
    } catch (err) {
      setError('Tải file thất bại. Vui lòng thử lại sau.');
      toast.error('Lỗi khi tải file', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal url-upload-modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link size={20} className="text-primary" />
            <h2>Tải từ liên kết</h2>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={handleClose} disabled={isDownloading}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="url-input-container">
            <input
              type="text"
              placeholder="Dán link YouTube, TikTok, Facebook, hoặc URL file trực tiếp..."
              className="form-input url-input"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlInfo(null);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && !urlInfo && handleCheckUrl()}
              disabled={isDownloading}
            />
            {!urlInfo && (
              <button 
                className="btn btn-primary" 
                onClick={handleCheckUrl}
                disabled={!url.trim() || isLoadingInfo}
              >
                {isLoadingInfo ? 'Đang kiểm tra...' : 'Kiểm tra'}
              </button>
            )}
          </div>

          {error && <div className="url-error"><AlertCircle size={14} /> {error}</div>}

          {urlInfo && (
            <div className="url-info-card">
              <div className="url-info-header">
                {urlInfo.type === 'social' ? (
                  <>
                    {urlInfo.thumbnail && <img src={urlInfo.thumbnail} alt="thumbnail" className="url-thumbnail" />}
                    <div className="url-details">
                      <p className="url-title">{urlInfo.title || 'Video'}</p>
                      <p className="url-meta">Nền tảng: <span style={{ textTransform: 'capitalize' }}>{urlInfo.platform}</span></p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="url-icon-placeholder">
                      <File size={24} />
                    </div>
                    <div className="url-details">
                      <p className="url-title">{urlInfo.title || 'File'}</p>
                      <p className="url-meta">
                        {urlInfo.mimeType || 'Không rõ loại'} 
                        {urlInfo.size ? ` • ${(urlInfo.size / (1024*1024)).toFixed(2)} MB` : ''}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {urlInfo.formats && urlInfo.formats.length > 1 && (
                <div className="url-format-selection">
                  <p className="form-label">Chọn định dạng tải xuống:</p>
                  <div className="format-options">
                    {urlInfo.formats.includes('video') && (
                      <button 
                        className={`format-option ${selectedFormat === 'video' ? 'active' : ''}`}
                        onClick={() => setSelectedFormat('video')}
                        disabled={isDownloading}
                      >
                        <Video size={16} /> Video (MP4)
                      </button>
                    )}
                    {urlInfo.formats.includes('mp3') && (
                      <button 
                        className={`format-option ${selectedFormat === 'mp3' ? 'active' : ''}`}
                        onClick={() => setSelectedFormat('mp3')}
                        disabled={isDownloading}
                      >
                        <Music size={16} /> Âm thanh (MP3)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={handleClose} disabled={isDownloading}>
            Hủy
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handleDownloadToDevice}
              disabled={!urlInfo || isDownloading}
            >
              <DownloadIcon size={16} style={{ marginRight: '6px' }} />
              Tải về máy
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleDownload}
              disabled={!urlInfo || isDownloading}
            >
              <DownloadCloud size={16} style={{ marginRight: '6px' }} />
              {isDownloading ? 'Đang tải...' : 'Lưu vào MyClound'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
