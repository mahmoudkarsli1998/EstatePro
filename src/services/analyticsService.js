import apiClient from './apiClient';

export const analyticsService = {
  // Dashboard
  getStats: () => apiClient.get('/dashboard/stats'),
  getAdminStats: () => apiClient.get('/dashboard/admin'),
  getManagerStats: () => apiClient.get('/dashboard/manager'),
  getSalesStats: () => apiClient.get('/dashboard/sales'),
  getAgentStats: () => apiClient.get('/dashboard/agent'),
  getSalesPerformance: () => apiClient.get('/dashboard/sales/performance'),
  getSalesOverview: () => apiClient.get('/dashboard/sales/stats'),
  getLeadsPipeline: () => apiClient.get('/dashboard/leads/pipeline'),
  getUnitsAvailability: () => apiClient.get('/dashboard/units/availability'),
  getRevenue: () => apiClient.get('/dashboard/revenue'),
  
  // Activities
  getActivities: (params) => apiClient.get('/activities', { params }), 
  getMyActivities: () => apiClient.get('/activities/mine'),
  getActivityById: (id) => apiClient.get(`/activities/${id}`),
  getUserActivities: (userId) => apiClient.get(`/activities/user/${userId}`),
  getProjectActivities: (projectId) => apiClient.get(`/activities/project/${projectId}`),
  getUnitActivities: (unitId) => apiClient.get(`/activities/unit/${unitId}`),
  getLeadActivities: (leadId) => apiClient.get(`/activities/lead/${leadId}`),
};
