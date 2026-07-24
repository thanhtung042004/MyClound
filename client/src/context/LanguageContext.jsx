import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations from './translations';

export const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', nativeLabel: 'Tiếng Việt' },
  { code: 'en', label: 'English',    flag: '🇺🇸', nativeLabel: 'English' },
  { code: 'zh', label: 'Tiếng Trung', flag: '🇨🇳', nativeLabel: '中文' },
  { code: 'ja', label: 'Tiếng Nhật', flag: '🇯🇵', nativeLabel: '日本語' },
  { code: 'ko', label: 'Tiếng Hàn',  flag: '🇰🇷', nativeLabel: '한국어' },
  { code: 'fr', label: 'Tiếng Pháp', flag: '🇫🇷', nativeLabel: 'Français' },
  { code: 'de', label: 'Tiếng Đức',  flag: '🇩🇪', nativeLabel: 'Deutsch' },
  { code: 'es', label: 'Tiếng Tây Ban Nha', flag: '🇪🇸', nativeLabel: 'Español' },
];

const LanguageContext = createContext(null);

// Resolve a dot-notation key from a translations object.
// Falls back to 'vi' if the current language doesn't have the key.
function resolve(obj, key) {
  return key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem('myclound_language') || 'vi'
  );

  const setLanguage = (code) => {
    setLanguageState(code);
    localStorage.setItem('myclound_language', code);
    document.documentElement.setAttribute('lang', code);
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // t(key) — look up translation, fallback to 'vi' if missing in current lang
  const t = useCallback((key) => {
    const dict = translations[language] || translations['vi'];
    const fallback = translations['vi'];
    const val = resolve(dict, key);
    if (val !== undefined) return val;
    return resolve(fallback, key) ?? key;
  }, [language]);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLang, LANGUAGES, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
