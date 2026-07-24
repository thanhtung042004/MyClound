import { useState, useEffect } from 'react';
import { fileService } from '../../services';
import FileCard from '../../components/FileCard/FileCard';
import PreviewModal from '../../components/Modal/PreviewModal';
import { Trash2, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function TrashPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const { t } = useLanguage();

  const load = async () => {
    try {
      const { data } = await fileService.getFiles({ trashed: true });
      setFiles(data.data);
    } catch { toast.error(t('toast.loadFail')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (file) => {
    try {
      await fileService.restoreFile(file._id);
      toast.success(t('toast.restoreSuccess'));
      load();
    } catch { toast.error(t('toast.restoreFail')); }
  };

  const handlePermDelete = async (file) => {
    if (!confirm(t('confirm.permDelete').replace('{name}', file.name))) return;
    try {
      await fileService.deleteFile(file._id, true);
      toast.success(t('toast.permDeleteSuccess'));
      load();
    } catch { toast.error(t('toast.permDeleteFail')); }
  };

  const handleEmptyTrash = async () => {
    if (!confirm(t('confirm.emptyTrash').replace('{count}', files.length))) return;
    try {
      await Promise.all(files.map(f => fileService.deleteFile(f._id, true)));
      toast.success(t('toast.emptyTrashSuccess'));
      setFiles([]);
    } catch { toast.error(t('toast.emptyTrashFail')); }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <Trash2 size={22} /> {t('trash.title')}
        </h1>
        {files.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={handleEmptyTrash}>
            {t('trash.deleteAll')}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗑️</div>
          <h3>{t('trash.emptyTitle')}</h3>
          <p>{t('trash.emptyDesc')}</p>
        </div>
      ) : (
        <div className="file-list">
          {files.map(file => (
            <div key={file._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <FileCard
                  file={file}
                  view="list"
                  onDelete={handlePermDelete}
                  onPreview={setPreviewFile}
                />
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleRestore(file)}
                data-tooltip={t('trash.restore')}
              >
                <RefreshCcw size={14} /> {t('trash.restore')}
              </button>
            </div>
          ))}
        </div>
      )}

      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} files={files} onNavigate={setPreviewFile} />
      )}
    </div>
  );
}
