import { useState, useRef, useEffect } from 'react';
import { getFileType, getFileColor, formatBytes, formatRelativeDate } from '../../utils/helpers';
import {
  Star, Trash2, Download, Edit3, MoreVertical,
  Image, Video, FileText, Music, Archive, Eye, Share2, File
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './FileCard.css';

const FILE_ICONS = { image: Image, video: Video, audio: Music, pdf: FileText, word: FileText, excel: FileText, powerpoint: FileText, archive: Archive, text: FileText, other: File };

const FileTypeIcon = ({ mimeType, resourceType, size = 32 }) => {
  const type = getFileType(mimeType, resourceType);
  const color = getFileColor(type);
  const Icon = FILE_ICONS[type] || File;
  return <Icon size={size} style={{ color }} />;
};

export default function FileCard({ file, view = 'grid', onDelete, onShare, onRename, onStar, onPreview }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isImage = file.mimeType?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/');
  const type = getFileType(file.mimeType, file.resourceType);
  const color = getFileColor(type);

  /* ── LIST VIEW ── */
  if (view === 'list') {
    return (
      <div className="file-list-item glass-card">
        {/* Thumb */}
        <div className="file-list-thumb" onClick={() => onPreview?.(file)}>
          {(isImage || isVideo) && file.thumbnailUrl ? (
            <img src={file.thumbnailUrl} alt={file.name} />
          ) : (
            <div className="file-list-icon" style={{ background: `${color}18` }}>
              <FileTypeIcon mimeType={file.mimeType} resourceType={file.resourceType} size={18} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="file-list-info" onClick={() => onPreview?.(file)}>
          <p className="file-name">{file.name}</p>
          <p className="file-meta">{formatBytes(file.size)} · {formatRelativeDate(file.createdAt)}</p>
        </div>

        {/* Type badge */}
        <span className="file-type-pill" style={{ color, background: `${color}18` }}>
          {file.format?.toUpperCase() || type}
        </span>

        {/* Shared badge */}
        {file.isShared && <span className="file-shared-badge">{t('fileCard.sharedBadge')}</span>}

        {/* Actions */}
        <div className="file-list-actions">
          <button
            className={`btn btn-ghost btn-icon file-action-btn ${file.isStarred ? 'starred' : ''}`}
            onClick={() => onStar?.(file)}
            data-tooltip={file.isStarred ? t('fileCard.unstarTooltip') : t('fileCard.starTooltip')}
          >
            <Star size={15} fill={file.isStarred ? 'var(--warning)' : 'none'} color={file.isStarred ? 'var(--warning)' : undefined} />
          </button>
          <button className="btn btn-ghost btn-icon file-action-btn" onClick={() => onShare?.(file)} data-tooltip={t('fileCard.shareTooltip')}>
            <Share2 size={15} />
          </button>
          <a href={file.secureUrl} download={file.originalName} className="btn btn-ghost btn-icon file-action-btn" data-tooltip={t('fileCard.downloadTooltip')}>
            <Download size={15} />
          </a>
          <div className="file-menu-wrapper" ref={menuRef}>
            <button className="btn btn-ghost btn-icon file-action-btn" onClick={() => setMenuOpen(!menuOpen)}>
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="context-menu file-menu">
                <button className="context-menu-item" onClick={() => { onRename?.(file); setMenuOpen(false); }}>
                  <Edit3 size={14} /> {t('fileCard.rename')}
                </button>
                <div className="divider" />
                <button className="context-menu-item danger" onClick={() => { onDelete?.(file); setMenuOpen(false); }}>
                  <Trash2 size={14} /> {t('fileCard.delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID VIEW ── */
  return (
    <div className="file-card glass-card">
      {/* Thumbnail */}
      <div className="file-card-thumb" onClick={() => onPreview?.(file)}>
        {isImage && file.thumbnailUrl ? (
          <img src={file.thumbnailUrl} alt={file.name} className="file-thumb-img" />
        ) : isVideo && file.thumbnailUrl ? (
          <>
            <img src={file.thumbnailUrl} alt={file.name} className="file-thumb-img" />
            <div className="video-overlay">
              <div className="video-play-btn"><Video size={18} /></div>
            </div>
          </>
        ) : (
          <div className="file-icon-placeholder" style={{ '--type-color': color, '--type-bg': `${color}15` }}>
            <div className="file-icon-wrap">
              <FileTypeIcon mimeType={file.mimeType} resourceType={file.resourceType} size={32} />
            </div>
            <span className="file-ext">{file.format?.toUpperCase()}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="file-card-overlay">
          <button className="overlay-btn" aria-label="Preview">
            <Eye size={16} />
          </button>
        </div>

        {/* Top badges */}
        <div className="file-card-badges">
          {file.isStarred && (
            <div className="file-badge file-star-badge">
              <Star size={11} fill="var(--warning)" color="var(--warning)" />
            </div>
          )}
          {file.isShared && (
            <div className="file-badge file-shared-indicator">
              <Share2 size={10} />
            </div>
          )}
        </div>
      </div>

      {/* Info + actions row */}
      <div className="file-card-footer">
        <div className="file-card-info">
          <p className="file-name" title={file.name}>{file.name}</p>
          <p className="file-meta">{formatBytes(file.size)}</p>
        </div>

        <div className="file-card-actions" ref={menuRef}>
          <button className="btn btn-ghost btn-icon btn-sm file-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div className="context-menu file-menu">
              <button className="context-menu-item" onClick={() => { onStar?.(file); setMenuOpen(false); }}>
                <Star size={13} fill={file.isStarred ? 'var(--warning)' : 'none'} color={file.isStarred ? 'var(--warning)' : 'currentColor'} />
                {file.isStarred ? t('fileCard.unstar') : t('fileCard.star')}
              </button>
              <button className="context-menu-item" onClick={() => { onShare?.(file); setMenuOpen(false); }}>
                <Share2 size={13} /> {t('fileCard.share')}
              </button>
              <button className="context-menu-item" onClick={() => { onPreview?.(file); setMenuOpen(false); }}>
                <Eye size={13} /> {t('fileCard.preview')}
              </button>
              <button className="context-menu-item" onClick={() => { onRename?.(file); setMenuOpen(false); }}>
                <Edit3 size={13} /> {t('fileCard.rename')}
              </button>
              <a href={file.secureUrl} download={file.originalName} className="context-menu-item">
                <Download size={13} /> {t('fileCard.download')}
              </a>
              <div className="divider" style={{ margin: '3px 0' }} />
              <button className="context-menu-item danger" onClick={() => { onDelete?.(file); setMenuOpen(false); }}>
                <Trash2 size={13} /> {t('fileCard.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
