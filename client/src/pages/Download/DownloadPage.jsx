import { useState } from 'react';
import { Link, CheckCircle, AlertCircle, File, DownloadCloud, Download as DownloadIcon, Video, Music } from 'lucide-react';
import { downloadService } from '../../services';
import toast from 'react-hot-toast';
import './DownloadPage.css';

export default function DownloadPage() {
  const [url, setUrl] = useState('');
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [urlInfo, setUrlInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('video');
  const [error, setError] = useState('');

  const handleCheckUrl = async () => {
    if (!url.trim()) return;
    setIsLoadingInfo(true);
    setError('');
    try {
      const { data } = await downloadService.getUrlInfo(url);
      setUrlInfo(data);
      if (data.formats?.length) setSelectedFormat(data.formats[0]);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể kiểm tra URL này. Bạn vẫn có thể thử tải xuống trực tiếp.');
      setUrlInfo({ type: 'unknown', formats: ['original'] });
      setSelectedFormat('original');
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setUrlInfo(null);
    setError('');
    setSelectedFormat('video');
  };

  const handleSaveToCloud = async () => {
    if (!url.trim()) return;
    setIsDownloading(true);
    setError('');
    const toastId = toast.loading('Đang tải file từ URL...');
    try {
      await downloadService.downloadFromUrl({ url, format: selectedFormat });
      toast.success('Đã lưu vào MyClound thành công!', { id: toastId });
      handleReset();
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
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const downloadUrl = window.URL.createObjectURL(blob);
      let filename = `download_${Date.now()}`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/['"]/g, '');
      }
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', decodeURIComponent(filename));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Đã tải xong!', { id: toastId });
      handleReset();
    } catch {
      setError('Tải file thất bại. Vui lòng thử lại sau.');
      toast.error('Lỗi khi tải file', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="download-page page-content">
      {/* Hero */}
      <div className="dl-hero">
        <div className="dl-hero-icon">
          <img src="/logoTailienket.jpg" alt="Tải từ liên kết" className="dl-hero-logo" />
        </div>
        <div>
          <h1 className="dl-hero-title">Tải từ liên kết</h1>
          <p className="dl-hero-sub">
            Dán link YouTube, TikTok, Facebook, Twitter hoặc URL file trực tiếp để tải về
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="dl-card glass-card">
        {/* URL input */}
        <div className="dl-input-row">
          <div className="dl-input-wrap">
            <Link size={16} className="dl-input-icon" />
            <input
              type="text"
              placeholder="Dán liên kết vào đây... (YouTube, TikTok, Facebook, URL file...)"
              className="dl-input"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlInfo(null); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && !urlInfo && handleCheckUrl()}
              disabled={isDownloading}
            />
            {url && !urlInfo && (
              <button className="dl-clear-btn" onClick={handleReset}>✕</button>
            )}
          </div>
          {!urlInfo ? (
            <button
              className="btn btn-primary dl-check-btn"
              onClick={handleCheckUrl}
              disabled={!url.trim() || isLoadingInfo}
              id="dl-check-btn"
            >
              {isLoadingInfo ? (
                <><span className="spinner" style={{ width: 16, height: 16 }} /> Kiểm tra...</>
              ) : 'Kiểm tra'}
            </button>
          ) : (
            <button className="btn btn-secondary dl-check-btn" onClick={handleReset}>
              Thử link khác
            </button>
          )}
        </div>

        {error && (
          <div className="dl-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Info card */}
        {urlInfo && (
          <div className="dl-info-card fade-in">
            <div className="dl-info-header">
              {urlInfo.thumbnail ? (
                <img src={urlInfo.thumbnail} alt="thumbnail" className="dl-thumbnail" />
              ) : (
                <div className="dl-thumb-placeholder">
                  <File size={28} />
                </div>
              )}
              <div className="dl-info-details">
                <p className="dl-info-title">{urlInfo.title || 'File'}</p>
                {urlInfo.platform && (
                  <p className="dl-info-meta">
                    Nền tảng: <span style={{ textTransform: 'capitalize', color: 'var(--accent-purple)' }}>{urlInfo.platform}</span>
                  </p>
                )}
                {urlInfo.mimeType && (
                  <p className="dl-info-meta">{urlInfo.mimeType}{urlInfo.size ? ` · ${(urlInfo.size / (1024 * 1024)).toFixed(2)} MB` : ''}</p>
                )}
                <div className="dl-info-badge">
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--success)' }}>Sẵn sàng tải xuống</span>
                </div>
              </div>
            </div>

            {urlInfo.formats && urlInfo.formats.length > 1 && (
              <div className="dl-format-row">
                <p className="form-label">Chọn định dạng:</p>
                <div className="dl-format-options">
                  {urlInfo.formats.includes('video') && (
                    <button
                      className={`dl-format-btn ${selectedFormat === 'video' ? 'active' : ''}`}
                      onClick={() => setSelectedFormat('video')}
                      disabled={isDownloading}
                    >
                      <Video size={15} /> Video (MP4)
                    </button>
                  )}
                  {urlInfo.formats.includes('mp3') && (
                    <button
                      className={`dl-format-btn ${selectedFormat === 'mp3' ? 'active' : ''}`}
                      onClick={() => setSelectedFormat('mp3')}
                      disabled={isDownloading}
                    >
                      <Music size={15} /> Âm thanh (MP3)
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="dl-action-row">
              <button
                className="btn btn-secondary"
                onClick={handleDownloadToDevice}
                disabled={isDownloading}
                id="dl-to-device-btn"
              >
                <DownloadIcon size={16} />
                {isDownloading ? 'Đang tải...' : 'Tải về máy'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveToCloud}
                disabled={isDownloading}
                id="dl-to-cloud-btn"
              >
                <DownloadCloud size={16} />
                {isDownloading ? 'Đang lưu...' : 'Lưu vào MyClound'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Supported platforms */}
      <div className="dl-platforms">
        <p className="dl-platforms-label">Hỗ trợ tải từ</p>
        <div className="dl-platform-list">
          {['YouTube', 'TikTok', 'Facebook', 'Twitter / X', 'Instagram', 'URL trực tiếp'].map(p => (
            <span key={p} className="dl-platform-tag">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
