import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const fileService = {
  getFiles: (params) => api.get('/files', { params }),
  uploadFiles: (formData, onProgress) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }),
  updateFile: (id, data) => api.put(`/files/${id}`, data),
  deleteFile: (id, permanent = false) => api.delete(`/files/${id}`, { params: { permanent } }),
  shareFile: (id, data) => api.post(`/files/${id}/share`, data),
  revokeShare: (id) => api.delete(`/files/${id}/share`),
  getSharedFile: (token) => api.get(`/files/shared/${token}`),
  restoreFile: (id) => api.put(`/files/${id}/restore`),
  getStats: () => api.get('/files/stats'),
};

export const folderService = {
  getFolders: (params) => api.get('/folders', { params }),
  createFolder: (data) => api.post('/folders', data),
  updateFolder: (id, data) => api.put(`/folders/${id}`, data),
  deleteFolder: (id) => api.delete(`/folders/${id}`),
  getBreadcrumb: (id) => api.get(`/folders/${id}/breadcrumb`),
};

export const downloadService = {
  getUrlInfo: (url) => api.get('/download/info', { params: { url } }),
  downloadFromUrl: (data) => api.post('/download/from-url', data),
  downloadToDevice: (data) => api.post('/download/to-device', data, { responseType: 'blob' }),
};
