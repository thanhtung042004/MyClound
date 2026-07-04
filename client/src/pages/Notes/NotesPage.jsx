import { useState, useEffect, useCallback, useRef } from 'react';
import { noteService } from '../../services';
import { NotebookPen, Plus, Trash2, Star, Download, Search, X, Save, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import './NotesPage.css';

const NOTE_COLORS = ['#6c63ff', '#3ecfcf', '#f59e0b', '#f43f5e', '#10b981', '#3b82f6', '#ec4899'];

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await noteService.getNotes({ sort: '-updatedAt' });
      setNotes(res.data.data);
    } catch {
      toast.error('Không thể tải ghi chú');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const handleCreate = async () => {
    try {
      const res = await noteService.createNote({ title: 'Ghi chú mới', content: '' });
      const newNote = res.data.data;
      setNotes(prev => [newNote, ...prev]);
      setActiveNote(newNote);
    } catch {
      toast.error('Tạo ghi chú thất bại');
    }
  };

  const handleSelect = (note) => {
    // flush pending save before switching
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setActiveNote(note);
  };

  const scheduleAutoSave = (updated) => {
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await noteService.updateNote(updated._id, {
          title: updated.title,
          content: updated.content,
        });
        setNotes(prev => prev.map(n => n._id === updated._id ? res.data.data : n));
      } catch {
        toast.error('Lưu thất bại');
      } finally {
        setSaving(false);
      }
    }, 900);
  };

  const handleTitleChange = (e) => {
    const updated = { ...activeNote, title: e.target.value };
    setActiveNote(updated);
    scheduleAutoSave(updated);
  };

  const handleContentChange = (e) => {
    const updated = { ...activeNote, content: e.target.value };
    setActiveNote(updated);
    scheduleAutoSave(updated);
  };

  const handleStar = async (note, e) => {
    e.stopPropagation();
    try {
      const res = await noteService.updateNote(note._id, { isStarred: !note.isStarred });
      const updated = res.data.data;
      setNotes(prev => prev.map(n => n._id === note._id ? updated : n));
      if (activeNote?._id === note._id) setActiveNote(updated);
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleDelete = async (note, e) => {
    e.stopPropagation();
    if (!confirm(`Xóa ghi chú "${note.title}"?`)) return;
    try {
      await noteService.deleteNote(note._id);
      setNotes(prev => prev.filter(n => n._id !== note._id));
      if (activeNote?._id === note._id) setActiveNote(null);
      toast.success('Đã xóa ghi chú');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleColorChange = async (color) => {
    try {
      const res = await noteService.updateNote(activeNote._id, { color });
      const updated = res.data.data;
      setActiveNote(updated);
      setNotes(prev => prev.map(n => n._id === updated._id ? updated : n));
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeNote.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="notes-page page-content">
      {/* Left panel */}
      <div className="notes-sidebar">
        <div className="notes-sidebar-header">
          <div className="notes-title-row">
            <NotebookPen size={20} className="notes-icon" />
            <h1 className="notes-heading">Ghi Chú</h1>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleCreate} id="new-note-btn">
            <Plus size={16} /> Mới
          </button>
        </div>

        <div className="notes-search-wrap">
          <Search size={15} className="notes-search-icon" />
          <input
            className="notes-search-input"
            placeholder="Tìm kiếm ghi chú..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="notes-search-clear" onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="notes-list">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12, marginBottom: 8 }} />)
          ) : filteredNotes.length === 0 ? (
            <div className="notes-empty-list">
              <span>Chưa có ghi chú nào</span>
              <button className="btn btn-primary btn-sm" onClick={handleCreate}>Tạo ngay</button>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note._id}
                className={`note-item ${activeNote?._id === note._id ? 'active' : ''}`}
                onClick={() => handleSelect(note)}
              >
                <div className="note-item-color-dot" style={{ background: note.color }} />
                <div className="note-item-body">
                  <p className="note-item-title">{note.title || 'Không có tiêu đề'}</p>
                  <p className="note-item-preview">
                    {note.content ? note.content.slice(0, 60).replace(/\n/g, ' ') : 'Trống...'}
                  </p>
                  <p className="note-item-date">{formatDate(note.updatedAt)}</p>
                </div>
                <div className="note-item-actions">
                  <button
                    className={`note-action-btn ${note.isStarred ? 'starred' : ''}`}
                    onClick={(e) => handleStar(note, e)}
                    title="Gắn sao"
                  >
                    <Star size={14} />
                  </button>
                  <button
                    className="note-action-btn danger"
                    onClick={(e) => handleDelete(note, e)}
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor panel */}
      <div className="notes-editor">
        {activeNote ? (
          <>
            <div className="notes-editor-header">
              <input
                className="note-title-input"
                value={activeNote.title}
                onChange={handleTitleChange}
                placeholder="Tiêu đề ghi chú..."
                maxLength={120}
              />
              <div className="notes-editor-actions">
                {saving && <span className="note-saving-badge">Đang lưu...</span>}
                {!saving && <span className="note-saved-badge">✓ Đã lưu</span>}

                {/* Color picker */}
                <div className="note-color-picker">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c}
                      className={`color-dot ${activeNote.color === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => handleColorChange(c)}
                      title={c}
                    />
                  ))}
                </div>

                <button className="btn btn-secondary btn-sm" onClick={handleDownload} title="Tải về .txt">
                  <Download size={15} /> Tải .txt
                </button>
                <button
                  className={`btn btn-sm ${activeNote.isStarred ? 'btn-starred' : 'btn-secondary'}`}
                  onClick={(e) => handleStar(activeNote, e)}
                  title="Gắn sao"
                >
                  <Star size={15} />
                </button>
              </div>
            </div>

            <div className="note-meta">
              Cập nhật: {formatDate(activeNote.updatedAt)} &nbsp;·&nbsp;
              {activeNote.content.length} ký tự
            </div>

            <textarea
              className="note-textarea"
              value={activeNote.content}
              onChange={handleContentChange}
              placeholder="Bắt đầu viết ghi chú..."
              spellCheck={false}
              style={{ '--note-accent': activeNote.color }}
            />
          </>
        ) : (
          <div className="notes-editor-empty">
            <div className="notes-editor-empty-icon">📝</div>
            <h2>Chọn hoặc tạo ghi chú</h2>
            <p>Ghi chú được lưu trực tuyến và tự động đồng bộ</p>
            <button className="btn btn-primary" onClick={handleCreate} id="notes-create-btn">
              <Plus size={18} /> Tạo ghi chú mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
