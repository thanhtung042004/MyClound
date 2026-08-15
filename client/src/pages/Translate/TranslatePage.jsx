import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Languages, Upload, Image, Video, X, Copy, Check,
  AlertCircle, Loader2, FileImage, FileVideo, Sparkles,
  Globe, ChevronRight,
} from 'lucide-react';
import './TranslatePage.css';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg', 'video/3gpp'];
const MAX_FILE_SIZE = 18 * 1024 * 1024; // 18 MB

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function TranslatePage() {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);       // { raw: File, type: 'image'|'video', previewUrl }
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGlobalDrag, setIsGlobalDrag] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState(null);   // Gemini result object
  const [copiedField, setCopiedField] = useState(null); // 'original' | 'translated'

  // Global drag detection for overlay
  useEffect(() => {
    const onDragEnter = () => setIsGlobalDrag(true);
    const onDragLeave = (e) => { if (!e.relatedTarget) setIsGlobalDrag(false); };
    const onDrop = () => setIsGlobalDrag(false);
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  const processFile = useCallback((raw) => {
    if (!raw) return;

    if (raw.size > MAX_FILE_SIZE) {
      toast.error(t('translate.errorSize'));
      return;
    }

    const isImage = ACCEPTED_IMAGE_TYPES.includes(raw.type);
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(raw.type);

    if (!isImage && !isVideo) {
      toast.error(t('translate.errorType'));
      return;
    }

    const previewUrl = URL.createObjectURL(raw);
    setFile({ raw, type: isImage ? 'image' : 'video', previewUrl });
    setResult(null);
  }, [t]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsGlobalDrag(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);

  const handleFileInput = (e) => {
    const selected = e.target.files[0];
    if (selected) processFile(selected);
    // reset so same file can be selected again
    e.target.value = '';
  };

  const handleClear = () => {
    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    setFile(null);
    setResult(null);
  };

  const handleTranslate = async () => {
    if (!file) {
      toast.error(t('translate.errorNoFile'));
      return;
    }

    setIsTranslating(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file.raw);

      const endpoint = file.type === 'image' ? '/translate/image' : '/translate/video';
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000, // 90s for video processing
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        toast.error(response.data.message || t('translate.errorApi'));
      }
    } catch (err) {
      console.error('Translate error:', err);
      const msg = err.response?.data?.message || t('translate.errorApi');
      toast.error(msg);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };

  const hasText = result && (result.originalText || result.translatedText);

  return (
    <div className="page-content">
      <div className="translate-page">

        {/* Header */}
        <div className="translate-header">
          <h1>
            <div className="translate-header-icon">
              <Languages size={22} color="white" />
            </div>
            <span className="gradient-text">{t('translate.title')}</span>
          </h1>
          <p>{t('translate.subtitle')}</p>
        </div>

        <div className="translate-body">

          {/* Upload Zone – show when no file selected */}
          {!file && (
            <div
              className={`translate-upload-zone ${isDragOver ? 'drag-over' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`upload-zone-icon ${isDragOver ? 'drag-active' : ''}`}>
                <Upload size={28} color="white" />
              </div>

              <div className="upload-zone-text">
                <h3>{t('translate.uploadTitle')}</h3>
                <p>{t('translate.uploadHint')}</p>
              </div>

              <div className="upload-zone-actions">
                <button
                  id="translate-browse-btn"
                  className="btn btn-primary btn-sm"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  <FileImage size={15} />
                  {t('translate.browseBtn')}
                </button>
              </div>

              <div className="upload-file-types">
                <span className="file-type-badge image">JPG</span>
                <span className="file-type-badge image">PNG</span>
                <span className="file-type-badge image">WEBP</span>
                <span className="file-type-badge image">GIF</span>
                <span className="file-type-badge video">MP4</span>
                <span className="file-type-badge video">MOV</span>
                <span className="file-type-badge video">AVI</span>
                <span className="file-type-badge video">WEBM</span>
              </div>
            </div>
          )}

          {/* File Preview Panel */}
          {file && (
            <div className="translate-preview-panel">
              <div className="file-preview-card glass-card">
                {/* Media preview */}
                {file.type === 'image' ? (
                  <img
                    src={file.previewUrl}
                    alt={file.raw.name}
                    className="file-preview-media"
                  />
                ) : (
                  <video
                    src={file.previewUrl}
                    className="file-preview-media video-preview"
                    controls
                    preload="metadata"
                  />
                )}

                {/* File info bar */}
                <div className="file-preview-info">
                  <div className="file-preview-meta">
                    <div className={`file-type-icon ${file.type === 'image' ? 'image-icon' : 'video-icon'}`}>
                      {file.type === 'image' ? <FileImage size={18} /> : <FileVideo size={18} />}
                    </div>
                    <div className="file-meta-text">
                      <strong title={file.raw.name}>{file.raw.name}</strong>
                      <span>
                        {file.type === 'image' ? t('translate.image') : t('translate.video')}
                        &nbsp;·&nbsp;{formatFileSize(file.raw.size)}
                      </span>
                    </div>
                  </div>
                  <div className="file-preview-actions">
                    <button
                      id="translate-change-file-btn"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      Đổi file
                    </button>
                    <button
                      id="translate-clear-btn"
                      className="btn btn-ghost btn-icon"
                      onClick={handleClear}
                      data-tooltip={t('translate.clearBtn')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="translate-action-bar">
                <button
                  id="translate-submit-btn"
                  className="btn btn-translate"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                >
                  {isTranslating ? (
                    <>
                      <Loader2 size={20} className="translate-spin" />
                      {t('translate.translating')}
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      {t('translate.translateBtn')}
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {isTranslating && (
            <div className="translate-result">
              <div className="translate-shimmer" />
              <div className="translate-shimmer" />
            </div>
          )}

          {/* Results */}
          {result && !isTranslating && (
            <div className="translate-result">
              {/* No text notice */}
              {!hasText && (
                <div className="no-text-notice" style={{ gridColumn: '1 / -1' }}>
                  <AlertCircle size={18} />
                  {t('translate.noText')}
                </div>
              )}

              {/* Original text card */}
              <div className="result-card">
                <div className="result-card-header">
                  <div className="result-card-title">
                    <Globe size={14} />
                    {t('translate.originalTitle')}
                  </div>
                  {result.detectedLanguage && (
                    <span className="result-lang-badge">
                      {result.detectedLanguage}
                    </span>
                  )}
                </div>

                <div className="result-card-body">
                  {result.originalText ? (
                    <>
                      <p className="result-text">{result.originalText}</p>
                      {(result.imageDescription || result.videoDescription) && (
                        <div className="result-description">
                          <div className="result-description-label">
                            <Image size={12} />
                            {file?.type === 'video' ? t('translate.videoDesc') : t('translate.imageDesc')}
                          </div>
                          <p className="result-description-text">
                            {result.imageDescription || result.videoDescription}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="result-text empty">{t('translate.noText')}</p>
                      {(result.imageDescription || result.videoDescription) && (
                        <div className="result-description">
                          <div className="result-description-label">
                            {file?.type === 'video' ? t('translate.videoDesc') : t('translate.imageDesc')}
                          </div>
                          <p className="result-description-text">
                            {result.imageDescription || result.videoDescription}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {result.originalText && (
                  <div className="result-card-footer">
                    <button
                      id="translate-copy-original-btn"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopy(result.originalText, 'original')}
                    >
                      {copiedField === 'original' ? <Check size={14} /> : <Copy size={14} />}
                      {copiedField === 'original' ? t('translate.copied') : t('translate.copy')}
                    </button>
                  </div>
                )}
              </div>

              {/* Translated text card */}
              <div className="result-card">
                <div className="result-card-header">
                  <div className="result-card-title">
                    <Languages size={14} />
                    {t('translate.translatedTitle')}
                  </div>
                  <span className="result-lang-badge vi">🇻🇳 Tiếng Việt</span>
                </div>

                <div className="result-card-body">
                  {result.translatedText ? (
                    <>
                      <p className="result-text">{result.translatedText}</p>
                      {(result.translatedDescription) && (
                        <div className="result-description">
                          <div className="result-description-label">
                            {file?.type === 'video' ? t('translate.videoDesc') : t('translate.imageDesc')}
                          </div>
                          <p className="result-description-text">{result.translatedDescription}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="result-text empty">{t('translate.noText')}</p>
                  )}
                </div>

                {result.translatedText && (
                  <div className="result-card-footer">
                    <button
                      id="translate-copy-translated-btn"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleCopy(result.translatedText, 'translated')}
                    >
                      {copiedField === 'translated' ? <Check size={14} /> : <Copy size={14} />}
                      {copiedField === 'translated' ? t('translate.copied') : t('translate.copy')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
          style={{ display: 'none' }}
          onChange={handleFileInput}
          id="translate-file-input"
        />

        {/* Full-screen drag overlay */}
        {isGlobalDrag && !file && (
          <div className="translate-drop-overlay">
            <div className="translate-drop-inner">
              <Upload size={40} />
              <span>Thả file vào đây</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
