import { useState, useEffect, useCallback, useRef } from 'react';
import { noteService } from '../../services';
import {
  NotebookPen, Plus, Trash2, Star, Download, Search, X, Pencil,
  ChevronLeft, ChevronRight, Bold, Italic, Underline as UnderlineIcon, Type, ChevronDown,
  AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './NotesPage.css';

// ── Custom toolbar dropdown (replaces native <select> for dark-mode compat) ──
function ToolbarDropdown({ options, placeholder, onChange, fontPreview = false, width }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleSelect = (opt) => {
    setSelected(opt);
    setOpen(false);
    onChange(opt.value);
  };

  return (
    <div ref={ref} className={`toolbar-dd ${open ? 'open' : ''}`} style={width ? { width } : {}}>
      <button
        type="button"
        className="toolbar-dd-trigger"
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o); }}
      >
        <span style={fontPreview && selected ? { fontFamily: selected.value } : {}}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="toolbar-dd-menu">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`toolbar-dd-item ${selected?.value === opt.value ? 'active' : ''}`}
              onMouseDown={e => { e.preventDefault(); handleSelect(opt); }}
              style={fontPreview ? { fontFamily: opt.value } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const NOTE_COLORS = ['#6c63ff', '#3ecfcf', '#f59e0b', '#f43f5e', '#10b981', '#3b82f6', '#ec4899'];

const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
];

const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '48px'];

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formatState, setFormatState] = useState({ bold: false, italic: false, underline: false, align: 'left' });

  const saveTimer = useRef(null);
  const renameInputRef = useRef(null);
  const editorRef = useRef(null);
  const activeNoteRef = useRef(null); // stable ref to avoid stale closure

  // Keep ref in sync
  useEffect(() => { activeNoteRef.current = activeNote; }, [activeNote]);

  // ── Load notes ──────────────────────────────────────────────────────────────
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

  // Sync editor HTML when switching notes (only on ID change to preserve cursor)
  useEffect(() => {
    if (editorRef.current && activeNote) {
      editorRef.current.innerHTML = activeNote.content || '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?._id]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
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

  // Rich-text editor input handler
  const handleEditorInput = () => {
    const note = activeNoteRef.current;
    if (!editorRef.current || !note) return;
    const html = editorRef.current.innerHTML;
    const updated = { ...note, content: html };
    setActiveNote(prev => prev ? { ...prev, content: html } : prev);
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

  // ── Inline rename ────────────────────────────────────────────────────────────
  const startRename = (note, e) => {
    e.stopPropagation();
    setRenamingId(note._id);
    setRenameValue(note.title);
    setTimeout(() => renameInputRef.current?.focus(), 30);
  };

  const commitRename = async (noteId) => {
    const trimmed = renameValue.trim();
    if (!trimmed) { cancelRename(); return; }
    const note = notes.find(n => n._id === noteId);
    if (!note || trimmed === note.title) { cancelRename(); return; }
    try {
      const res = await noteService.updateNote(noteId, { title: trimmed });
      const updated = res.data.data;
      setNotes(prev => prev.map(n => n._id === noteId ? updated : n));
      if (activeNote?._id === noteId) setActiveNote(updated);
      toast.success('Đã đổi tên ghi chú');
    } catch {
      toast.error('Đổi tên thất bại');
    } finally {
      cancelRename();
    }
  };

  const cancelRename = () => { setRenamingId(null); setRenameValue(''); };

  // ── Formatting ───────────────────────────────────────────────────────────────
  const updateFormatState = () => {
    try {
      const align =
        document.queryCommandState('justifyCenter') ? 'center' :
        document.queryCommandState('justifyRight')  ? 'right'  :
        document.queryCommandState('justifyFull')   ? 'justify': 'left';
      setFormatState({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        align,
      });
    } catch { /* ignore */ }
  };

  const execFormat = (command) => {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(command, false, null);
    editorRef.current?.focus();
    updateFormatState();
    handleEditorInput();
  };

  const execAlign = (command) => {
    document.execCommand(command, false, null);
    editorRef.current?.focus();
    updateFormatState();
    handleEditorInput();
  };

  const applyFontSize = (px) => {
    // Use placeholder size 7, then swap to CSS px value
    document.execCommand('styleWithCSS', false, false);
    document.execCommand('fontSize', false, '7');
    editorRef.current?.querySelectorAll('font[size="7"]').forEach(el => {
      el.style.fontSize = px;
      el.removeAttribute('size');
    });
    editorRef.current?.focus();
    handleEditorInput();
  };

  const applyFontFamily = (family) => {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('fontName', false, family);
    editorRef.current?.focus();
    handleEditorInput();
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
    const tmp = document.createElement('div');
    tmp.innerHTML = activeNote.content || '';
    const text = tmp.innerText || tmp.textContent || '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.content || '').replace(/<[^>]*>/g, '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getCharCount = () => {
    if (!activeNote?.content) return 0;
    const tmp = document.createElement('div');
    tmp.innerHTML = activeNote.content;
    return (tmp.innerText || tmp.textContent || '').length;
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="notes-page page-content">

      {/* ── Left sidebar ── */}
      <div className={`notes-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>

        <div className="notes-sidebar-header">
          {!sidebarCollapsed && (
            <>
              <div className="notes-title-row">
                <NotebookPen size={20} className="notes-icon" />
                <h1 className="notes-heading">Ghi Chú</h1>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleCreate} id="new-note-btn">
                <Plus size={16} /> Mới
              </button>
            </>
          )}
          <button
            className="notes-sidebar-toggle"
            onClick={() => setSidebarCollapsed(c => !c)}
            title={sidebarCollapsed ? 'Mở rộng danh sách' : 'Thu gọn danh sách'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {sidebarCollapsed ? (
          <div className="notes-sidebar-mini">
            <button className="btn btn-primary btn-icon" onClick={handleCreate} title="Tạo ghi chú mới">
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <>
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
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12, marginBottom: 8 }} />
                ))
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
                      {renamingId === note._id ? (
                        <input
                          ref={renameInputRef}
                          className="note-item-rename-input"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={() => commitRename(note._id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitRename(note._id);
                            if (e.key === 'Escape') cancelRename();
                          }}
                          onClick={e => e.stopPropagation()}
                          maxLength={120}
                        />
                      ) : (
                        <p
                          className="note-item-title"
                          onDoubleClick={e => startRename(note, e)}
                          title="Double-click để đổi tên"
                        >
                          {note.title || 'Không có tiêu đề'}
                        </p>
                      )}
                      <p className="note-item-preview">
                        {(note.content || '').replace(/<[^>]*>/g, '').slice(0, 60).replace(/\n/g, ' ') || 'Trống...'}
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
                        className="note-action-btn"
                        onClick={e => startRename(note, e)}
                        title="Đổi tên"
                      >
                        <Pencil size={14} />
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
          </>
        )}
      </div>

      {/* ── Editor panel ── */}
      <div className="notes-editor">
        {activeNote ? (
          <>
            {/* Header */}
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

            {/* Formatting toolbar */}
            <div className="note-toolbar">
              {/* Text style buttons */}
              <div className="note-toolbar-group">
                <button
                  className={`note-tool-btn ${formatState.bold ? 'active' : ''}`}
                  onMouseDown={e => { e.preventDefault(); execFormat('bold'); }}
                  title="In đậm (Ctrl+B)"
                >
                  <Bold size={15} />
                </button>
                <button
                  className={`note-tool-btn ${formatState.italic ? 'active' : ''}`}
                  onMouseDown={e => { e.preventDefault(); execFormat('italic'); }}
                  title="In nghiêng (Ctrl+I)"
                >
                  <Italic size={15} />
                </button>
                <button
                  className={`note-tool-btn ${formatState.underline ? 'active' : ''}`}
                  onMouseDown={e => { e.preventDefault(); execFormat('underline'); }}
                  title="Gạch chân (Ctrl+U)"
                >
                  <UnderlineIcon size={15} />
                </button>
              </div>

              <div className="note-toolbar-divider" />

              {/* Font family */}
              <div className="note-toolbar-group">
                <Type size={14} className="note-toolbar-label-icon" />
                <ToolbarDropdown
                  options={FONT_FAMILIES}
                  placeholder="Kiểu chữ"
                  onChange={applyFontFamily}
                  fontPreview
                  width="120px"
                />
              </div>

              <div className="note-toolbar-divider" />

              {/* Font size */}
              <div className="note-toolbar-group">
                <ToolbarDropdown
                  options={FONT_SIZES.map(s => ({ label: s, value: s }))}
                  placeholder="Cỡ chữ"
                  onChange={applyFontSize}
                  width="84px"
                />
              </div>

              <div className="note-toolbar-divider" />

              {/* Alignment */}
              <div className="note-toolbar-group">
                <button
                  className={`note-tool-btn ${formatState.align === 'left' ? 'active' : ''}`}
                  onMouseDown={e => { e.preventDefault(); execAlign('justifyLeft'); }}
                  title="Căn trái"
                >
                  <AlignLeft size={15} />
                </button>
                <button
                  className={`note-tool-btn ${formatState.align === 'center' ? 'active' : ''}`}
                  onMouseDown={e => { e.preventDefault(); execAlign('justifyCenter'); }}
                  title="Căn giữa"
                >
                  <AlignCenter size={15} />
                </button>
                <button
                  className={`note-tool-btn ${formatState.align === 'right' ? 'active' : ''}`}
                  onMouseDown={e => { e.preventDefault(); execAlign('justifyRight'); }}
                  title="Căn phải"
                >
                  <AlignRight size={15} />
                </button>
              </div>
            </div>

            {/* Meta */}
            <div className="note-meta">
              Cập nhật: {formatDate(activeNote.updatedAt)} &nbsp;·&nbsp;
              {getCharCount()} ký tự
            </div>

            {/* Rich text editor area */}
            <div
              ref={editorRef}
              className="note-editor-content"
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyUp={updateFormatState}
              onMouseUp={updateFormatState}
              style={{ '--note-accent': activeNote.color }}
              data-placeholder="Bắt đầu viết ghi chú..."
              spellCheck={false}
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
