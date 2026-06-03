import { useState, useRef } from 'react';
import { Search, Bell, Upload, Plus, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UrlUploadModal from '../Upload/UrlUploadModal';
import './Header.css';

export default function Header({ onSearch, onUpload }) {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) onSearch(value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/files?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="app-header">
      {/* Search */}
      <div className={`header-search ${isSearchFocused ? 'focused' : ''}`}>
        <Search size={16} className="search-icon" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Tìm kiếm file, thư mục..."
          value={searchValue}
          onChange={handleSearch}
          onKeyDown={handleSearchSubmit}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="search-input"
        />
        {searchValue && (
          <span className="search-shortcut" onClick={() => {
            setSearchValue('');
            if (onSearch) onSearch('');
          }}>✕</span>
        )}
      </div>

      {/* Actions */}
      <div className="header-actions">
        <button className="btn btn-ghost btn-icon header-notif" data-tooltip="Thông báo">
          <Bell size={18} />
        </button>

        <button 
          className="btn btn-secondary" 
          onClick={() => setIsUrlModalOpen(true)} 
          id="url-upload-btn"
          title="Tải từ liên kết"
        >
          <Link size={16} />
          Tải từ liên kết
        </button>

        <button className="btn btn-primary" onClick={onUpload} id="upload-btn">
          <Upload size={16} />
          Upload
        </button>

        <button className="btn btn-secondary btn-icon" data-tooltip="Tạo thư mục" id="create-folder-btn">
          <Plus size={18} />
        </button>
      </div>

      <UrlUploadModal 
        isOpen={isUrlModalOpen} 
        onClose={() => setIsUrlModalOpen(false)} 
        onSuccess={() => window.location.reload()}
      />
    </header>
  );
}
