import { useState, useEffect } from 'react';
import { fileService } from '../../services';
import FileCard from '../../components/FileCard/FileCard';
import ShareModal from '../../components/Modal/ShareModal';
import PreviewModal from '../../components/Modal/PreviewModal';
import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SharedPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareFile, setShareFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Get all files and filter shared ones
        const { data } = await fileService.getFiles({ sort: '-createdAt' });
        setFiles(data.data.filter(f => f.isShared));
      } catch { toast.error('Không thể tải'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="page-content">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Share2 size={22} /> File đang chia sẻ
        </span>
      </h1>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔗</div>
          <h3>Chưa có file nào được chia sẻ</h3>
          <p>Khi bạn tạo link chia sẻ, file sẽ xuất hiện ở đây</p>
        </div>
      ) : (
        <div className="file-grid">
          {files.map(file => (
            <FileCard
              key={file._id}
              file={file}
              view="grid"
              onShare={setShareFile}
              onPreview={setPreviewFile}
            />
          ))}
        </div>
      )}

      {shareFile && <ShareModal file={shareFile} onClose={() => setShareFile(null)} />}
      {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} files={files} onNavigate={setPreviewFile} />}
    </div>
  );
}
