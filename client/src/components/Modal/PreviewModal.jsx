import { useState, useEffect, useCallback } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { formatBytes, formatDate } from '../../utils/helpers';
import { useLanguage } from '../../context/LanguageContext';
import './Modal.css';

export default function PreviewModal({ file, onClose, files = [], onNavigate }) {
  const [zoom, setZoom] = useState(1);
  const { t } = useLanguage();
  const currentIndex = files.findIndex(f => f._id === file._id);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(files[currentIndex - 1]);
  }, [currentIndex, files, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < files.length - 1) onNavigate(files[currentIndex + 1]);
  }, [currentIndex, files, onNavigate]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, handlePrev, handleNext]);

  const isImage = file.mimeType?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/');
  const isPdf = file.mimeType === 'application/pdf';

  return (
    <div className="preview-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Header */}
      <div className="preview-header">
        <div className="preview-file-info">
          <p className="preview-file-name">{file.name}</p>
          <p className="preview-file-meta">{formatBytes(file.size)} · {formatDate(file.createdAt)}</p>
        </div>
        <div className="preview-actions">
          {isImage && (
            <>
              <button className="btn btn-ghost btn-icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                <ZoomOut size={18} />
              </button>
              <span className="zoom-label">{Math.round(zoom * 100)}%</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setZoom(z => Math.min(4, z + 0.25))}>
                <ZoomIn size={18} />
              </button>
              <button className="btn btn-ghost btn-icon" onClick={() => setZoom(1)}>
                <RotateCcw size={18} />
              </button>
            </>
          )}
          <a href={file.secureUrl} download={file.originalName} className="btn btn-secondary btn-sm">
            <Download size={16} /> {t('previewModal.download')}
          </a>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="preview-content">
        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button className="preview-nav prev" onClick={handlePrev}>
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="preview-body">
          {isImage && (
            <img
              src={file.secureUrl}
              alt={file.name}
              className="preview-image"
              style={{ transform: `scale(${zoom})` }}
              draggable={false}
            />
          )}
          {isVideo && (
            <video
              src={file.secureUrl}
              controls
              autoPlay
              className="preview-video"
            />
          )}
          {isPdf && (
            <iframe
              src={file.secureUrl}
              title={file.name}
              className="preview-iframe"
            />
          )}
          {!isImage && !isVideo && !isPdf && (
            <div className="preview-unsupported">
              <div className="preview-file-icon">📄</div>
              <p>{t('previewModal.unsupported')}</p>
              <p className="preview-format">{file.format?.toUpperCase()}</p>
              <a href={file.secureUrl} download={file.originalName} className="btn btn-primary" style={{ marginTop: 16 }}>
                <Download size={16} /> {t('previewModal.downloadToView')}
              </a>
            </div>
          )}
        </div>

        {currentIndex < files.length - 1 && (
          <button className="preview-nav next" onClick={handleNext}>
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
