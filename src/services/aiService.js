import apiClient from './apiClient';

export const aiService = {
  /**
   * Send a query to the AI (Legacy)
   */
  query: async (question, enableRag = true) => {
    const res = await apiClient.post('/ai/query', { question, enableRag });
    return res?.data || res;
  },

  /**
   * Send a chat message (Multi-turn)
   */
  chat: async (question, sessionId = null, enableRag = true, leadInfo = null) => {
    const res = await apiClient.post('/ai/chat', { 
        question, 
        sessionId, 
        enableRag,
        leadInfo 
    });
    return res?.data || res;
  },

  /**
   * Get all sessions for the current visitor
   */
  getMySessions: async (limit = 20, offset = 0) => {
    const res = await apiClient.get('/ai/sessions', { params: { limit, offset } });
    return res?.data || res;
  },

  /**
   * Get specific session details
   */
  getSession: async (sessionId) => {
    const res = await apiClient.get(`/ai/sessions/${sessionId}`);
    return res?.data || res;
  },

  /**
   * ADMIN: Get specific session details (no ownership check)
   */
  getSessionAsAdmin: async (sessionId) => {
    const res = await apiClient.get(`/ai/admin/sessions/${sessionId}`);
    return res;
  },

  /**
   * ADMIN: Get all sessions (for Dashboard)
   * Returns { data: [...], total, page, totalPages }
   */
  getAllSessions: async (limit = 20, offset = 0) => {
    // apiClient interceptor already extracts response.data, so just return res
    const res = await apiClient.get('/ai/admin/sessions', { params: { limit, offset } });
    return res; // res is already { data: [...], total, page, totalPages }
  },

  /**
   * Clear session history
   */
  clearSession: async (sessionId) => {
    const res = await apiClient.post(`/ai/sessions/${sessionId}/clear`);
    return res?.data || res;
  },

  /**
   * Delete session
   */
  deleteSession: async (sessionId) => {
    const res = await apiClient.delete(`/ai/sessions/${sessionId}`);
    return res?.data || res;
  },

  /**
   * Trigger knowledge base re-indexing
   */
  reindexAi: async () => {
    const res = await apiClient.post('/ai/reindex');
    return res?.data || res;
  }
};
