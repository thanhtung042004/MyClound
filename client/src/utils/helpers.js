// Format bytes to human readable
export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Get file type category
export const getFileType = (mimeType, resourceType) => {
  if (!mimeType) return 'other';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType === 'text/csv') return 'excel';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'powerpoint';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return 'archive';
  if (mimeType === 'application/json' || mimeType === 'text/plain') return 'text';
  return 'other';
};

// Get color for file type
export const getFileColor = (type) => {
  const colors = {
    image: '#3ecfcf',
    video: '#f59e0b',
    audio: '#8b5cf6',
    pdf: '#ef4444',
    word: '#3b82f6',
    excel: '#22c55e',
    powerpoint: '#f97316',
    archive: '#a855f7',
    text: '#94a3b8',
    other: '#6b7280',
  };
  return colors[type] || colors.other;
};

// Get file icon emoji
export const getFileIcon = (type) => {
  const icons = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    pdf: '📄',
    word: '📝',
    excel: '📊',
    powerpoint: '📑',
    archive: '📦',
    text: '📃',
    other: '📁',
  };
  return icons[type] || icons.other;
};

// Format date
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date relative
export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return formatDate(dateStr);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Storage percentage
export const getStoragePercent = (used, limit) => {
  if (!limit) return 0;
  return Math.min(Math.round((used / limit) * 100), 100);
};
