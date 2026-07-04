import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fileService, folderService } from '../../services';
import FileCard from '../../components/FileCard/FileCard';
import UploadModal from '../../components/Upload/UploadModal';
import ShareModal from '../../components/Modal/ShareModal';
import PreviewModal from '../../components/Modal/PreviewModal';
import { Grid, List, FolderPlus, SortDesc, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import './FilesPage.css';

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: '-createdAt' },
  { label: 'Cũ nhất', value: 'createdAt' },
  { label: 'Tên A-Z', value: 'name' },
  { label: 'Tên Z-A', value: '-name' },
  { label: 'Lớn nhất', value: '-size' },
  { label: 'Nhỏ nhất', value: 'size' },
];

export default function FilesPage() {
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('-createdAt');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareFile, setShareFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [createFolderName, setCreateFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const typeFilter = searchParams.get('type') || '';
  const searchQuery = searchParams.get('search') || '';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Only fetch folders when not filtering by type (folders are type-agnostic)
      const requests = [
        fileService.getFiles({
          folder: currentFolder || '',
          type: typeFilter,
          search: searchQuery,
          sort,
        }),
      ];
      if (!typeFilter && !searchQuery) {
        requests.push(folderService.getFolders({ parent: currentFolder || '' }));
      }
      const [filesRes, foldersRes] = await Promise.all(requests);
      setFiles(filesRes.data.data);
      setFolders(foldersRes ? foldersRes.data.data : []);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [currentFolder, typeFilter, searchQuery, sort]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (file) => {
    if (!confirm(`Xóa file "${file.name}"?`)) return;
    try {
      await fileService.deleteFile(file._id);
      toast.success('Đã chuyển vào thùng rác');
      loadData();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleStar = async (file) => {
    try {
      await fileService.updateFile(file._id, { isStarred: !file.isStarred });
      setFiles(prev => prev.map(f => f._id === file._id ? { ...f, isStarred: !f.isStarred } : f));
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleRename = async (file) => {
    const newName = prompt('Tên mới:', file.name);
    if (!newName || newName === file.name) return;
    try {
      await fileService.updateFile(file._id, { name: newName });
      setFiles(prev => prev.map(f => f._id === file._id ? { ...f, name: newName } : f));
      toast.success('Đã đổi tên');
    } catch {
      toast.error('Đổi tên thất bại');
    }
  };

  const handleCreateFolder = async () => {
    if (!createFolderName.trim()) return;
    try {
      await folderService.createFolder({ name: createFolderName, parent: currentFolder });
      toast.success('Đã tạo thư mục');
      setCreateFolderName('');
      setShowCreateFolder(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tạo thất bại');
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (!confirm(`Xóa thư mục "${folder.name}" và tất cả nội dung bên trong?`)) return;
    try {
      await folderService.deleteFolder(folder._id);
      toast.success('Đã xóa thư mục');
      loadData();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const pageTitle = typeFilter === 'image' ? 'Hình ảnh'
    : typeFilter === 'video' ? 'Video'
    : typeFilter === 'document' ? 'Tài liệu'
    : searchQuery ? `Kết quả cho "${searchQuery}"`
    : 'Tất cả file';

  return (
    <div className="files-page page-content">
      {/* Header */}
      <div className="files-header">
        <h1 className="files-title">{pageTitle}</h1>
        <div className="files-controls">
          <select
            className="form-input sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="view-toggle">
            <button
              className={`btn btn-ghost btn-icon ${view === 'grid' ? 'active-view' : ''}`}
              onClick={() => setView('grid')}
              data-tooltip="Lưới"
            >
              <Grid size={18} />
            </button>
            <button
              className={`btn btn-ghost btn-icon ${view === 'list' ? 'active-view' : ''}`}
              onClick={() => setView('list')}
              data-tooltip="Danh sách"
            >
              <List size={18} />
            </button>
          </div>

          <button className="btn btn-secondary" onClick={() => setShowCreateFolder(true)} id="new-folder-btn">
            <FolderPlus size={16} /> Thư mục mới
          </button>
          <button className="btn btn-primary" onClick={() => setUploadOpen(true)} id="files-upload-btn">
            Upload
          </button>
        </div>
      </div>

      {/* Create folder inline */}
      {showCreateFolder && (
        <div className="create-folder-bar glass-card">
          <input
            autoFocus
            className="form-input"
            placeholder="Tên thư mục..."
            value={createFolderName}
            onChange={(e) => setCreateFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowCreateFolder(false); }}
          />
          <button className="btn btn-primary btn-sm" onClick={handleCreateFolder}>Tạo</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateFolder(false)}>Hủy</button>
        </div>
      )}

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="breadcrumb">
          <button className="breadcrumb-item" onClick={() => setCurrentFolder(null)}>Tất cả file</button>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item active">Thư mục hiện tại</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className={view === 'grid' ? 'file-grid' : 'file-list'}>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className={`skeleton ${view === 'grid' ? 'skeleton-card' : 'skeleton-row'}`} />
          ))}
        </div>
      ) : (
        <>
          {/* Folders */}
          {folders.length > 0 && (
            <div className="section">
              <h2 className="section-title">Thư mục</h2>
              <div className="folder-grid">
                {folders.map(folder => (
                  <div
                    key={folder._id}
                    className="folder-card glass-card"
                    onClick={() => setCurrentFolder(folder._id)}
                    onContextMenu={(e) => { e.preventDefault(); }}
                  >
                    <div className="folder-icon" style={{ color: folder.color }}>📁</div>
                    <div className="folder-info">
                      <p className="folder-name">{folder.name}</p>
                    </div>
                    <button
                      className="btn btn-ghost btn-icon btn-sm folder-delete"
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files.length === 0 && folders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <h3>Chưa có file nào</h3>
              <p>Upload file đầu tiên hoặc tạo thư mục mới</p>
              <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>
                Upload ngay
              </button>
            </div>
          ) : files.length > 0 ? (
            <div className="section">
              {folders.length > 0 && <h2 className="section-title">File</h2>}
              <div className={view === 'grid' ? 'file-grid' : 'file-list'}>
                {files.map(file => (
                  <FileCard
                    key={file._id}
                    file={file}
                    view={view}
                    onDelete={handleDelete}
                    onShare={setShareFile}
                    onRename={handleRename}
                    onStar={handleStar}
                    onPreview={setPreviewFile}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Modals */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={currentFolder}
        onSuccess={loadData}
      />

      {shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() => setShareFile(null)}
        />
      )}

      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          files={files}
          onNavigate={setPreviewFile}
        />
      )}
    </div>
  );
}
