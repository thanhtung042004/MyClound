import { useState, useRef, useEffect } from 'react';
import { Search, Upload, FolderPlus } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Header.css';

export default function Header({ onSearch, onUpload, onCreateFolder }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const urlQuery = searchParams.get('search') || '';

  const [searchValue, setSearchValue] = useState(urlQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const { t, currentLang } = useLanguage();

  // Keep search input synced with URL parameter
  useEffect(() => {
    setSearchValue(urlQuery);
  }, [urlQuery]);

  const doSearch = (query) => {
    const trimmed = query.trim();
    if (onSearch) onSearch(trimmed);

    if (trimmed) {
      navigate(`/files?search=${encodeURIComponent(trimmed)}`);
    } else if (location.pathname === '/files') {
      navigate('/files');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    // Realtime search if already on files page or live search
    doSearch(value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      doSearch(searchValue);
    }
  };

  const handleClear = () => {
    setSearchValue('');
    doSearch('');
  };

  return (
    <header className="app-header">
      {/* Search */}
      <div className={`header-search ${isSearchFocused ? 'focused' : ''}`}>
        <Search size={15} className="search-icon" onClick={() => doSearch(searchValue)} style={{ cursor: 'pointer' }} />
        <input
          ref={searchRef}
          type="text"
          placeholder={t('header.search')}
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="search-input"
        />
        {searchValue && (
          <span className="search-clear" onClick={handleClear}>✕</span>
        )}
        <kbd className="search-kbd">⌘K</kbd>
      </div>

      {/* Actions */}
      <div className="header-actions">
        {/* Language badge */}
        <span className="header-lang-badge" title={currentLang.nativeLabel}>
          {currentLang.flag}
        </span>

        {/* New Folder */}
        {onCreateFolder && (
          <button className="btn btn-secondary header-folder-btn" onClick={onCreateFolder} id="header-folder-btn">
            <FolderPlus size={15} />
            <span className="header-btn-label">{t('files.newFolder')}</span>
          </button>
        )}

        {/* Upload */}
        <button className="btn btn-primary header-upload-btn" onClick={onUpload} id="upload-btn">
          <Upload size={15} />
          <span>{t('header.upload')}</span>
        </button>
      </div>
    </header>
  );
}
