import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, ExternalLink, Trash2, Edit2, X, Link2, Globe, Tag, Check } from 'lucide-react';
import { linkService } from '../../services';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import './LinksPage.css';

const ACCENT_COLORS = [
  '#6c63ff', '#f43f5e', '#10b981', '#f59e0b',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

function AddLinkModal({ onClose, onSave, initialData, t }) {
  const [form, setForm] = useState(initialData
    ? { url: initialData.url, title: initialData.title || '', description: initialData.description || '', color: initialData.color || '#6c63ff', tags: (initialData.tags || []).join(', ') }
    : { url: '', title: '', description: '', color: '#6c63ff', tags: '' }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url.trim()) return toast.error(t('toast.urlRequired'));

    let url = form.url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    setLoading(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      await onSave({ ...form, url, tags });
      onClose();
    } catch {
      // handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="links-modal-overlay" onClick={onClose}>
      <div className="links-modal" onClick={e => e.stopPropagation()}>
        <div className="links-modal-header">
          <div className="links-modal-title">
            <Link2 size={20} />
            <span>{initialData ? t('links.modal.editTitle') : t('links.modal.addTitle')}</span>
          </div>
          <button className="links-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="links-modal-form">
          <div className="links-form-group">
            <label>URL <span className="required">*</span></label>
            <div className="links-input-wrap">
              <Globe size={16} className="links-input-icon" />
              <input
                type="text"
                placeholder="https://example.com"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                autoFocus
              />
            </div>
          </div>

          <div className="links-form-group">
            <label>{t('links.modal.titleLabel')}</label>
            <input
              type="text"
              placeholder={t('links.modal.titlePlaceholder')}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="links-form-group">
            <label>{t('links.modal.descLabel')}</label>
            <textarea
              placeholder={t('links.modal.descPlaceholder')}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="links-form-group">
            <label>{t('links.modal.tagsLabel')}</label>
            <div className="links-input-wrap">
              <Tag size={16} className="links-input-icon" />
              <input
                type="text"
                placeholder={t('links.modal.tagsPlaceholder')}
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
            </div>
          </div>

          <div className="links-form-group">
            <label>{t('links.modal.colorLabel')}</label>
            <div className="links-color-picker">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-dot ${form.color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                >
                  {form.color === c && <Check size={10} />}
                </button>
              ))}
            </div>
          </div>

          <div className="links-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>{t('links.modal.cancel')}</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? t('links.modal.saving') : t('links.modal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LinkCard({ link, onDelete, onEdit, t }) {
  const handleClick = (e) => {
    if (e.target.closest('.link-card-actions')) return;
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const displayUrl = () => {
    try {
      const u = new URL(link.url);
      return u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '');
    } catch {
      return link.url;
    }
  };

  return (
    <div className="link-card" onClick={handleClick} style={{ '--card-color': link.color }}>
      <div className="link-card-accent" />
      <div className="link-card-inner">
        <div className="link-card-header">
          <div className="link-favicon-wrap">
            {link.favicon ? (
              <img
                src={link.favicon}
                alt=""
                className="link-favicon"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div className="link-favicon-fallback" style={{ display: link.favicon ? 'none' : 'flex', background: link.color }}>
              <Globe size={16} color="white" />
            </div>
          </div>
          <div className="link-card-title-wrap">
            <h3 className="link-card-title">{link.title || displayUrl()}</h3>
            <p className="link-card-url">{displayUrl()}</p>
          </div>
          <div className="link-card-actions">
            <button
              className="link-action-btn edit"
              onClick={e => { e.stopPropagation(); onEdit(link); }}
              title={t('links.edit')}
            >
              <Edit2 size={14} />
            </button>
            <button
              className="link-action-btn delete"
              onClick={e => { e.stopPropagation(); onDelete(link._id); }}
              title={t('links.delete')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {link.description && (
          <p className="link-card-desc">{link.description}</p>
        )}

        {link.tags?.length > 0 && (
          <div className="link-card-tags">
            {link.tags.map(tag => (
              <span key={tag} className="link-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="link-card-footer">
          <ExternalLink size={12} />
          <span>{t('links.open')}</span>
        </div>
      </div>
    </div>
  );
}

export default function LinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editLink, setEditLink] = useState(null);
  const { t } = useLanguage();

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      const res = await linkService.getLinks(params);
      setLinks(res.data.data || []);
    } catch {
      toast.error(t('toast.loadLinksFail'));
    } finally {
      setLoading(false);
    }
  }, [search, t]);

  useEffect(() => {
    const timer = setTimeout(fetchLinks, 300);
    return () => clearTimeout(timer);
  }, [fetchLinks]);

  const handleSave = async (data) => {
    try {
      if (editLink) {
        const res = await linkService.updateLink(editLink._id, data);
        setLinks(prev => prev.map(l => l._id === editLink._id ? res.data.data : l));
        toast.success(t('toast.linkUpdateSuccess'));
        setEditLink(null);
      } else {
        const res = await linkService.createLink(data);
        setLinks(prev => [res.data.data, ...prev]);
        toast.success(t('toast.linkSaveSuccess'));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || t('toast.linkError'));
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm.deleteLink'))) return;
    try {
      await linkService.deleteLink(id);
      setLinks(prev => prev.filter(l => l._id !== id));
      toast.success(t('toast.linkDeleteSuccess'));
    } catch {
      toast.error(t('toast.linkDeleteFail'));
    }
  };

  const openEdit = (link) => {
    setEditLink(link);
    setShowAdd(true);
  };

  return (
    <div className="links-page">
      {/* Header */}
      <div className="links-header">
        <div className="links-header-left">
          <div className="links-header-icon">
            <Link2 size={24} />
          </div>
          <div>
            <h1 className="links-title">{t('links.title')}</h1>
            <p className="links-subtitle">{links.length} {t('links.saved')}</p>
          </div>
        </div>
        <button className="links-add-btn" onClick={() => { setEditLink(null); setShowAdd(true); }}>
          <Plus size={18} />
          <span>{t('links.add')}</span>
        </button>
      </div>

      {/* Search */}
      <div className="links-search-wrap">
        <Search size={16} className="links-search-icon" />
        <input
          type="text"
          className="links-search"
          placeholder={t('links.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="links-search-clear" onClick={() => setSearch('')}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="links-loading">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="link-card-skeleton" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="links-empty">
          <div className="links-empty-icon">
            <Link2 size={48} />
          </div>
          <h3>{search ? t('links.noResults') : t('links.noLinks')}</h3>
          <p>{search ? t('links.noResultsDesc') : t('links.noLinksDesc')}</p>
          {!search && (
            <button className="links-add-btn" onClick={() => { setEditLink(null); setShowAdd(true); }}>
              <Plus size={16} />
              <span>{t('links.addFirst')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="links-grid">
          {links.map(link => (
            <LinkCard key={link._id} link={link} onDelete={handleDelete} onEdit={openEdit} t={t} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showAdd && (
        <AddLinkModal
          onClose={() => { setShowAdd(false); setEditLink(null); }}
          onSave={handleSave}
          initialData={editLink}
          t={t}
        />
      )}
    </div>
  );
}
