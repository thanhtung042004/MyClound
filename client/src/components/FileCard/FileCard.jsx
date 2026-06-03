import { useState, useRef, useEffect } from 'react';
import { getFileType, getFileColor, formatBytes, formatRelativeDate } from '../../utils/helpers';
import {
  Star, Trash2, Download, Edit3, MoreVertical,
  Image, Video, FileText, Music, Archive, Eye, Share2
} from 'lucide-react';
import './FileCard.css';

const FileTypeIcon = ({ mimeType, resourceType, size = 32 }) => {
  const type = getFileType(mimeType, resourceType);
  const color = getFileColor(type);

  const icons = {
    image: Image,
    video: Video,
    audio: Music,
    pdf: FileText,
    word: FileText,
    excel: FileText,
    powerpoint: FileText,
    archive: Archive,
    text: FileText,
    other: FileText,
  };

  const Icon = icons[type] || FileText;
  return <Icon size={size} style={{ color }} />;
};

export default function FileCard({ file, view = 'grid', onDelete, onShare, onRename, onStar, onPreview }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isImage = file.mimeType?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/');
  const type = getFileType(file.mimeType, file.resourceType);
  const color = getFileColor(type);

  if (view === 'list') {
    return (
      <div className="file-list-item glass-card">
        <div className="file-list-thumb" onClick={() => onPreview?.(file)}>
          {isImage && file.thumbnailUrl ? (
            <img src={file.thumbnailUrl} alt={file.name} />
          ) : (
            <div className="file-list-icon" style={{ color }}>
              <FileTypeIcon mimeType={file.mimeType} resourceType={file.resourceType} size={20} />
            </div>
          )}
        </div>
        <div className="file-list-info" onClick={() => onPreview?.(file)}>
          <p className="file-name">{file.name}</p>
          <p className="file-meta">{formatBytes(file.size)} · {formatRelativeDate(file.createdAt)}</p>
        </div>
        {file.isShared && <span className="file-shared-badge">Chia sẻ</span>}
        <div className="file-list-actions">
          <button
            className={`btn btn-ghost btn-icon ${file.isStarred ? 'starred' : ''}`}
            onClick={() => onStar?.(file)}
            data-tooltip={file.isStarred ? 'Bỏ gắn sao' : 'Gắn sao'}
          >
            <Star size={16} fill={file.isStarred ? 'var(--warning)' : 'none'} color={file.isStarred ? 'var(--warning)' : undefined} />
          </button>
          <button className="btn btn-ghost btn-icon" onClick={() => onShare?.(file)} data-tooltip="Chia sẻ">
            <Share2 size={16} />
          </button>
          <a href={file.secureUrl} download={file.originalName} className="btn btn-ghost btn-icon" data-tooltip="Tải xuống">
            <Download size={16} />
          </a>
          <div className="file-menu-wrapper" ref={menuRef}>
            <button className="btn btn-ghost btn-icon" onClick={() => setMenuOpen(!menuOpen)}>
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="context-menu file-menu">
                <button className="context-menu-item" onClick={() => { onRename?.(file); setMenuOpen(false); }}>
                  <Edit3 size={14} /> Đổi tên
                </button>
                <button className="context-menu-item danger" onClick={() => { onDelete?.(file); setMenuOpen(false); }}>
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="file-card glass-card">
      {/* Thumbnail */}
      <div className="file-card-thumb" onClick={() => onPreview?.(file)}>
        {isImage && file.thumbnailUrl ? (
          <img src={file.thumbnailUrl} alt={file.name} className="file-thumb-img" />
        ) : isVideo && file.thumbnailUrl ? (
          <>
            <img src={file.thumbnailUrl} alt={file.name} className="file-thumb-img" />
            <div className="video-overlay"><Video size={20} /></div>
          </>
        ) : (
          <div className="file-icon-placeholder" style={{ '--type-color': color }}>
            <FileTypeIcon mimeType={file.mimeType} resourceType={file.resourceType} size={36} />
            <span className="file-ext">{file.format?.toUpperCase()}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="file-card-overlay">
          <button className="overlay-btn">
            <Eye size={16} />
          </button>
        </div>

        {/* Star badge */}
        {file.isStarred && (
          <div className="file-star-badge">
            <Star size={12} fill="var(--warning)" color="var(--warning)" />
          </div>
        )}
        {/* Shared badge */}
        {file.isShared && (
          <div className="file-shared-indicator">
            <Share2 size={10} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="file-card-info">
        <p className="file-name" title={file.name}>{file.name}</p>
        <p className="file-meta">{formatBytes(file.size)}</p>
      </div>

      {/* Actions */}
      <div className="file-card-actions">
        <div className="file-menu-wrapper" ref={menuRef}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreVertical size={14} color="var(--text-muted)" />
          </button>
          {menuOpen && (
            <div className="context-menu file-menu">
              <button className="context-menu-item" onClick={() => { onStar?.(file); setMenuOpen(false); }}>
                <Star size={13} fill={file.isStarred ? 'var(--warning)' : 'none'} color={file.isStarred ? 'var(--warning)' : 'currentColor'} />
                {file.isStarred ? 'Bỏ đánh dấu' : 'Đánh dấu'}
              </button>
              <button className="context-menu-item" onClick={() => { onShare?.(file); setMenuOpen(false); }}>
                <Share2 size={13} /> Chia sẻ
              </button>

              <button className="context-menu-item" onClick={() => { onRename?.(file); setMenuOpen(false); }}>
                <Edit3 size={13} /> Đổi tên
              </button>
              <a href={file.secureUrl} download={file.originalName} className="context-menu-item">
                <Download size={13} /> Tải xuống
              </a>
              <div className="divider" style={{ margin: '3px 0' }} />
              <button className="context-menu-item danger" onClick={() => { onDelete?.(file); setMenuOpen(false); }}>
                <Trash2 size={13} /> Xóa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
