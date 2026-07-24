import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, File } from 'lucide-react';
import { fileService } from '../../services';
import { formatBytes } from '../../utils/helpers';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import './UploadModal.css';

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export default function UploadModal({ isOpen, onClose, folderId, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useLanguage();

  const onDrop = useCallback((accepted, rejected) => {
    const newFiles = accepted.map(f => ({ file: f, status: 'pending', id: Math.random().toString(36) }));
    setFiles(prev => [...prev, ...newFiles]);

    if (rejected.length > 0) {
      rejected.forEach(({ file, errors }) => {
        errors.forEach(e => toast.error(`${file.name}: ${e.message}`));
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE,
  });

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach(({ file }) => formData.append('files', file));
    if (folderId) formData.append('folder', folderId);

    try {
      await fileService.uploadFiles(formData, setProgress);
      toast.success(t('toast.uploadSuccess').replace('{count}', files.length));
      setFiles([]);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || t('toast.uploadFail');
      toast.error(msg, { duration: 6000 });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal upload-modal">
        <div className="modal-header">
          <h3>{t('uploadModal.title')}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Dropzone */}
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dropzone-content">
              <div className="dropzone-icon">
                <Upload size={32} />
              </div>
              {isDragActive ? (
                <p>{t('uploadModal.dropActive')}</p>
              ) : (
                <>
                  <p>{t('uploadModal.dropHint')} <span className="click-link">{t('uploadModal.clickHint')}</span></p>
                  <p className="dropzone-hint">{t('uploadModal.supportHint')} <span style={{color:'var(--warning, #f59e0b)'}}>{t('uploadModal.imageLimit')}</span></p>
                </>
              )}
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="upload-file-list">
              {files.map(({ file, status, id }) => (
                <div key={id} className="upload-file-item">
                  <div className="upload-file-icon">
                    <File size={16} />
                  </div>
                  <div className="upload-file-info">
                    <p className="upload-file-name">{file.name}</p>
                    <p className="upload-file-size">{formatBytes(file.size)}</p>
                  </div>
                  {status === 'done' && <CheckCircle size={16} color="var(--success)" />}
                  {status === 'error' && <AlertCircle size={16} color="var(--danger)" />}
                  {status === 'pending' && !uploading && (
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeFile(id)}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="progress-text">{progress}% — {t('uploadModal.progress')}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={uploading}>{t('uploadModal.cancel')}</button>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            id="confirm-upload-btn"
          >
            {uploading ? (
              <><span className="spinner" style={{ width: 14, height: 14 }} /> {t('uploadModal.uploading')}</>
            ) : (
              <><Upload size={16} /> {t('uploadModal.upload')} {files.length > 0 ? `(${files.length})` : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
