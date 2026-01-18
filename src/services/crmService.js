import apiClient from './apiClient';

export const crmService = {
  // Leads
  getLeads: async (params) => {
      const res = await apiClient.get('/leads');
      console.log("getLeads RAW RES:", res); // DEBUG
      const all = Array.isArray(res) ? res : (res?.data || res?.items || res?.leads || []);
      
      // Normalize _id to id (including nested followUps)
      const normalized = all.map(l => ({ 
        ...l, 
        id: l.id || l._id,
        followUps: (l.followUps || []).map(f => ({ ...f, id: f.id || f._id })) 
      }));
      
      if (params) {
        let result = normalized;
        if (params.status) result = result.filter(l => l.status === params.status);
        if (params.agentId) result = result.filter(l => l.assignedAgentId == params.agentId);
        return result;
      }
      return normalized;
  },
  createLead: (data) => apiClient.post('/leads', data), // Public endpoint uses same path usually, or check /public? Prompt says POST /leads
  getLeadById: (id) => apiClient.get(`/leads/${id}`),
  updateLead: (id, data) => apiClient.patch(`/leads/${id}`, data),
  deleteLead: (id) => apiClient.delete(`/leads/${id}`),
  updateLeadStatus: (id, status) => apiClient.patch(`/leads/${id}/status`, { status }),
  assignAgent: (id, agentId) => apiClient.patch(`/leads/${id}/assign`, { agentId }),
  addFollowUp: (id, data) => apiClient.post(`/leads/${id}/follow-up`, data),
  getFollowUps: (id) => apiClient.get(`/leads/${id}/follow-ups`),
  updateFollowUp: (leadId, id, data) => apiClient.patch(`/leads/${leadId}/follow-ups/${id}`, data),
  deleteFollowUp: (leadId, id) => apiClient.delete(`/leads/${leadId}/follow-ups/${id}`),
  getMyLeads: () => apiClient.get('/leads/my-leads'),
  convertLead: (id) => apiClient.post(`/leads/${id}/convert`),
  getAssignableUsers: async () => {
    const res = await apiClient.get('/users/assignable');
    return (Array.isArray(res) ? res : []).map(u => ({ ...u, id: u.id || u._id }));
  },

  // Agents
  getAgents: async () => {
    const res = await apiClient.get('/agents');
    const items = Array.isArray(res) ? res : (res?.data || res?.items || []);
    return items.map(i => ({ ...i, id: i.id || i._id }));
  },
  createAgent: (data) => apiClient.post('/agents', data),
  getAgentById: (id) => apiClient.get(`/agents/${id}`),
  updateAgent: (id, data) => apiClient.patch(`/agents/${id}`, data),
  deleteAgent: (id) => apiClient.delete(`/agents/${id}`),
  getAgentLeads: (id) => apiClient.get(`/agents/${id}/leads`),
  getAgentPerformance: (id) => apiClient.get(`/agents/${id}/performance`),
  assignProjectsToAgent: (id, projectIds) => apiClient.post(`/agents/${id}/assign-projects`, { projectIds }),
  removeProjectFromAgent: (id, projectId) => apiClient.delete(`/agents/${id}/projects/${projectId}`),
  getAgentDashboard: (id) => apiClient.get(`/agents/${id}/dashboard`),

  // Users
  getUsers: async () => {
    const res = await apiClient.get('/users');
    const items = Array.isArray(res) ? res : (res?.data || res?.items || []);
    return items.map(i => ({ ...i, id: i.id || i._id }));
  },
  createUser: (data) => apiClient.post('/users', data),
  getManagers: async () => {
    const res = await apiClient.get('/users', { params: { role: 'manager' } });
    const items = Array.isArray(res) ? res : (res?.data || res?.items || []);
    return items.map(i => ({ ...i, id: i.id || i._id }));
  },
  getAdmins: async () => {
    const res = await apiClient.get('/users', { params: { role: 'admin' } });
    const items = Array.isArray(res) ? res : (res?.data || res?.items || []);
    return items.map(i => ({ ...i, id: i.id || i._id }));
  },
  createManager: (data) => apiClient.post('/users', { ...data, role: 'manager' }),
  updateManager: (id, data) => apiClient.patch(`/users/${id}`, data),
  deleteManager: (id) => apiClient.delete(`/users/${id}`),
  createAdmin: (data) => apiClient.post('/users', { ...data, role: 'admin' }),
  updateAdmin: (id, data) => apiClient.patch(`/users/${id}`, data),
  deleteAdmin: (id) => apiClient.delete(`/users/${id}`),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  updateUser: (id, data) => apiClient.patch(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  getActivities: (page = 1, limit = 10) => apiClient.get('/activities', { params: { page, limit } }),
  getUserActivities: (id) => apiClient.get(`/users/${id}/activities`),
  updateUserStatus: (id, status) => apiClient.patch(`/users/${id}/status`, { status }),
  updateUserRole: (id, role) => apiClient.patch(`/users/${id}/role`, { role }),
  
  // Lookup user by email - GET /users/lookup?email=...
  lookupUserByEmail: async (email) => {
    const res = await apiClient.get('/users/lookup', { params: { email } });
    return res ? { ...res, id: res.id || res._id } : null;
  },

  // Notifications
  getNotifications: async () => {
    const res = await apiClient.get('/notifications');
    const items = Array.isArray(res) ? res : (res?.data || res?.items || []);
    return items.map(n => ({ ...n, id: n.id || n._id }));
  },
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.patch('/notifications/read-all'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
  
  // Create a notification
  createNotification: (data) => apiClient.post('/notifications', {
    title: data.title,
    message: data.message,
    type: data.type || 'INFO',
    userId: data.userId,      // Target user ID (who should see this)
    metadata: data.metadata,  // Optional metadata (leadId, projectId, etc.)
    isRead: false
  }),
};
