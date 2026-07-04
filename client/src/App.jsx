import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import FilesPage from './pages/Files/FilesPage';
import SharedPage from './pages/Shared/SharedPage';
import TrashPage from './pages/Trash/TrashPage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotesPage from './pages/Notes/NotesPage';
import DownloadPage from './pages/Download/DownloadPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#f0f0ff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '0.9rem',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#f0f0ff' } },
              error: { iconTheme: { primary: '#f43f5e', secondary: '#f0f0ff' } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/files" element={<FilesPage />} />
              <Route path="/starred" element={<FilesPage filterStarred />} />
              <Route path="/shared" element={<SharedPage />} />
              <Route path="/trash" element={<TrashPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/download" element={<DownloadPage />} />
            </Route>

            {/* Default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
