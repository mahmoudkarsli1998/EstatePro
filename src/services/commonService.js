import apiClient from './apiClient';

export const commonService = {
  // Cities
  getCities: async () => {
    const res = await apiClient.get('/cities');
    return Array.isArray(res) ? res : (res?.data || res?.items || []);
  },
  createCity: (data) => apiClient.post('/cities', data),
  getCityById: (id) => apiClient.get(`/cities/${id}`),
  updateCity: (id, data) => apiClient.patch(`/cities/${id}`, data),
  deleteCity: (id) => apiClient.delete(`/cities/${id}`),
  
  // Developers
  getDevelopers: async () => {
    const res = await apiClient.get('/developers');
    return Array.isArray(res) ? res : (res?.data || res?.items || []);
  },
  createDeveloper: (data) => apiClient.post('/developers', data),
  getDeveloperById: (id) => apiClient.get(`/developers/${id}`),
  updateDeveloper: (id, data) => apiClient.patch(`/developers/${id}`, data),
  deleteDeveloper: (id) => apiClient.delete(`/developers/${id}`),
  getDeveloperProjects: (id) => apiClient.get(`/developers/${id}/projects`),
  getDeveloperStats: (id) => apiClient.get(`/developers/${id}/stats`),

  // Uploads
  uploadFile: (formData) => apiClient.post('/uploads', formData, {headers: {'Content-Type': 'multipart/form-data'}}),
  uploadMultiple: (formData) => apiClient.post('/uploads/multiple', formData, {headers: {'Content-Type': 'multipart/form-data'}}),
  deleteFile: (filename) => apiClient.delete(`/uploads/${filename}`),
  getFile: (filename) => apiClient.get(`/uploads/${filename}`),
  uploadImages: (formData) => apiClient.post('/uploads/images', formData, {headers: {'Content-Type': 'multipart/form-data'}}),
  uploadDocuments: (formData) => apiClient.post('/uploads/documents', formData, {headers: {'Content-Type': 'multipart/form-data'}}),

  // Reports
  getProjectReports: () => apiClient.get('/reports/projects'),
  getUnitReports: () => apiClient.get('/reports/units'),
  getLeadReports: () => apiClient.get('/reports/leads'),
  getSalesReport: () => apiClient.get('/reports/sales'),
  getAgentReports: () => apiClient.get('/reports/agents'),
  exportExcel: (data) => apiClient.post('/reports/export/excel', data, { responseType: 'blob' }),
  exportPdf: (data) => apiClient.post('/reports/export/pdf', data, { responseType: 'blob' }),

  // Notifications
  getNotifications: () => apiClient.get('/notifications'),
  getUnreadNotifications: () => apiClient.get('/notifications/unread'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/mark-all-read'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),

  // Settings
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.patch('/settings', data),
  getCompanySettings: () => apiClient.get('/settings/company'),
  updateCompanySettings: (data) => apiClient.patch('/settings/company', data),
};
