import { useState, useEffect } from 'react';
import { fileService } from '../../services';
import FileCard from '../../components/FileCard/FileCard';
import PreviewModal from '../../components/Modal/PreviewModal';
import { Trash2, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrashPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);

  const load = async () => {
    try {
      const { data } = await fileService.getFiles({ trashed: true });
      setFiles(data.data);
    } catch { toast.error('Không thể tải'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (file) => {
    try {
      await fileService.restoreFile(file._id);
      toast.success('Đã khôi phục file');
      load();
    } catch { toast.error('Khôi phục thất bại'); }
  };

  const handlePermDelete = async (file) => {
    if (!confirm(`Xóa vĩnh viễn "${file.name}"? Không thể hoàn tác!`)) return;
    try {
      await fileService.deleteFile(file._id, true);
      toast.success('Đã xóa vĩnh viễn');
      load();
    } catch { toast.error('Xóa thất bại'); }
  };

  const handleEmptyTrash = async () => {
    if (!confirm(`Xóa vĩnh viễn tất cả ${files.length} file? Không thể hoàn tác!`)) return;
    try {
      await Promise.all(files.map(f => fileService.deleteFile(f._id, true)));
      toast.success('Đã dọn sạch thùng rác');
      setFiles([]);
    } catch { toast.error('Xảy ra lỗi'); }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <Trash2 size={22} /> Thùng rác
        </h1>
        {files.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={handleEmptyTrash}>
            Xóa tất cả
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
          <h3>Thùng rác trống</h3>
          <p>Các file đã xóa sẽ xuất hiện ở đây</p>
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
                data-tooltip="Khôi phục"
              >
                <RefreshCcw size={14} /> Khôi phục
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
