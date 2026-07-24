import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fileService, folderService } from '../../services';
import FileCard from '../../components/FileCard/FileCard';
import UploadModal from '../../components/Upload/UploadModal';
import ShareModal from '../../components/Modal/ShareModal';
import PreviewModal from '../../components/Modal/PreviewModal';
import { Grid, List, FolderPlus, SortDesc, Search, Filter } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import './FilesPage.css';

export default function FilesPage({ filterStarred = false }) {
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

  const { t } = useLanguage();

  const typeFilter = searchParams.get('type') || '';
  const searchQuery = searchParams.get('search') || '';

  const SORT_OPTIONS = [
    { label: t('files.sort.newest'), value: '-createdAt' },
    { label: t('files.sort.oldest'), value: 'createdAt' },
    { label: t('files.sort.nameAZ'), value: 'name' },
    { label: t('files.sort.nameZA'), value: '-name' },
    { label: t('files.sort.largest'), value: '-size' },
    { label: t('files.sort.smallest'), value: 'size' },
  ];

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
      if (!typeFilter && !searchQuery && !filterStarred) {
        requests.push(folderService.getFolders({ parent: currentFolder || '' }));
      }
      const [filesRes, foldersRes] = await Promise.all(requests);
      setFiles(filesRes.data.data);
      setFolders(foldersRes ? foldersRes.data.data : []);
    } catch {
      toast.error(t('toast.loadDataFail'));
    } finally {
      setLoading(false);
    }
  }, [currentFolder, typeFilter, searchQuery, sort, t]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (file) => {
    if (!confirm(`${t('confirm.deleteFile')} "${file.name}"?`)) return;
    try {
      await fileService.deleteFile(file._id);
      toast.success(t('toast.trashSuccess'));
      loadData();
    } catch {
      toast.error(t('toast.trashFail'));
    }
  };

  const handleStar = async (file) => {
    try {
      await fileService.updateFile(file._id, { isStarred: !file.isStarred });
      setFiles(prev => prev.map(f => f._id === file._id ? { ...f, isStarred: !f.isStarred } : f));
    } catch {
      toast.error(t('toast.actionFail'));
    }
  };

  const handleRename = async (file) => {
    const newName = prompt(t('prompt.rename'), file.name);
    if (!newName || newName === file.name) return;
    try {
      await fileService.updateFile(file._id, { name: newName });
      setFiles(prev => prev.map(f => f._id === file._id ? { ...f, name: newName } : f));
      toast.success(t('toast.renameSuccess'));
    } catch {
      toast.error(t('toast.renameFail'));
    }
  };

  const handleCreateFolder = async () => {
    if (!createFolderName.trim()) return;
    try {
      await folderService.createFolder({ name: createFolderName, parent: currentFolder });
      toast.success(t('toast.folderCreateSuccess'));
      setCreateFolderName('');
      setShowCreateFolder(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('toast.folderCreateFail'));
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (!confirm(t('confirm.deleteFolder').replace('{name}', folder.name))) return;
    try {
      await folderService.deleteFolder(folder._id);
      toast.success(t('toast.folderDeleteSuccess'));
      loadData();
    } catch {
      toast.error(t('toast.folderDeleteFail'));
    }
  };

  const displayedFiles = filterStarred ? files.filter(f => f.isStarred) : files;

  const pageTitle = filterStarred ? t('files.starred')
    : typeFilter === 'image' ? t('files.images')
    : typeFilter === 'video' ? t('files.video')
    : typeFilter === 'document' ? t('files.documents')
    : searchQuery ? `${t('files.searchResult')} "${searchQuery}"`
    : t('files.title');

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
              data-tooltip={t('files.tooltipGrid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`btn btn-ghost btn-icon ${view === 'list' ? 'active-view' : ''}`}
              onClick={() => setView('list')}
              data-tooltip={t('files.tooltipList')}
            >
              <List size={18} />
            </button>
          </div>

          <button className="btn btn-secondary" onClick={() => setShowCreateFolder(true)} id="new-folder-btn">
            <FolderPlus size={16} /> {t('files.newFolder')}
          </button>
          <button className="btn btn-primary" onClick={() => setUploadOpen(true)} id="files-upload-btn">
            {t('files.upload')}
          </button>
        </div>
      </div>

      {/* Create folder inline */}
      {showCreateFolder && (
        <div className="create-folder-bar glass-card">
          <input
            autoFocus
            className="form-input"
            placeholder={t('files.folderPlaceholder')}
            value={createFolderName}
            onChange={(e) => setCreateFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowCreateFolder(false); }}
          />
          <button className="btn btn-primary btn-sm" onClick={handleCreateFolder}>{t('files.create')}</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateFolder(false)}>{t('files.cancel')}</button>
        </div>
      )}

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="breadcrumb">
          <button className="breadcrumb-item" onClick={() => setCurrentFolder(null)}>{t('files.allFiles')}</button>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item active">{t('files.currentFolder')}</span>
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
              <h2 className="section-title">{t('files.folders')}</h2>
              <div className="folder-grid">
                {folders.map(folder => (
                  <div
                    key={folder._id}
                    className="folder-card glass-card"
                    onClick={() => setCurrentFolder(folder._id)}
                  >
                    <div className="folder-icon-wrap">📁</div>
                    <div className="folder-info">
                      <p className="folder-name">{folder.name}</p>
                    </div>
                    <button
                      className="btn btn-ghost btn-icon btn-sm folder-delete"
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                      data-tooltip={t('files.cancel')}
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
              <h3>{t('files.emptyTitle')}</h3>
              <p>{t('files.emptyDesc')}</p>
              <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>
                {t('files.uploadNow')}
              </button>
            </div>
          ) : displayedFiles.length > 0 ? (
            <div className="section">
              {folders.length > 0 && <h2 className="section-title">{t('files.files')}</h2>}
              <div className={view === 'grid' ? 'file-grid' : 'file-list'}>
                {displayedFiles.map(file => (
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
