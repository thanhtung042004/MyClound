import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import { useState } from 'react';
import UploadModal from '../Upload/UploadModal';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header onUpload={() => setUploadOpen(true)} />
        <Outlet />
      </div>
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  );
}
