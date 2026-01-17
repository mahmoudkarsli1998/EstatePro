import apiClient from './apiClient';

/**
 * Multi-turn Chat Service
 * Handles conversation sessions with the AI backend
 */

/**
 * Send a chat message with session context and optional lead capture
 * @param {string} question - The user's message
 * @param {string|null} sessionId - Session ID for conversation continuity (null for new session)
 * @param {boolean} enableRag - Whether to enable RAG/semantic search
 * @param {object|null} leadInfo - { name, phone } for lead capture (first message only)
 * @returns {Promise<Object>} - Response with sessionId, message, data, target, leadId, etc.
 */
export const sendChatMessage = async (question, sessionId = null, enableRag = true, leadInfo = null) => {
  try {
    const payload = { question, enableRag };
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    if (leadInfo) {
      payload.leadInfo = leadInfo;
    }

    console.log('📤 [Chat Service] Sending payload:', JSON.stringify(payload, null, 2));

    const response = await apiClient.post('/ai/chat', payload);
    
    console.log('💬 [Chat Service] Response:', response);
    
    // Normalize response keys (handle " explanation" -> "explanation")
    const normalized = {};
    Object.keys(response).forEach(key => {
      normalized[key.trim()] = response[key];
    });
    
    // Ensure 'message' field exists (use explanation as fallback)
    if (!normalized.message && normalized.explanation) {
      normalized.message = normalized.explanation;
    }
    
    return normalized;
  } catch (error) {
    console.error('Chat Message Error:', error);
    throw error;
  }
};

/**
 * Get list of chat sessions
 * @param {number} limit - Number of sessions to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Object>} - { sessions: [], total: number }
 */
export const getSessions = async (limit = 20, offset = 0) => {
  try {
    const response = await apiClient.get(`/ai/sessions?limit=${limit}&offset=${offset}`);
    return response;
  } catch (error) {
    console.error('Get Sessions Error:', error);
    throw error;
  }
};

/**
 * Get full history for a specific session
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} - { sessionId, title, messages: [] }
 */
export const getSessionHistory = async (sessionId) => {
  try {
    const response = await apiClient.get(`/ai/sessions/${sessionId}`);
    return response;
  } catch (error) {
    console.error('Get Session History Error:', error);
    throw error;
  }
};

/**
 * Delete a session
 * @param {string} sessionId - The session ID to delete
 * @returns {Promise<Object>}
 */
export const deleteSession = async (sessionId) => {
  try {
    const response = await apiClient.delete(`/ai/sessions/${sessionId}`);
    return response;
  } catch (error) {
    console.error('Delete Session Error:', error);
    throw error;
  }
};

/**
 * Clear messages from a session (keeps session, removes messages)
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>}
 */
export const clearSession = async (sessionId) => {
  try {
    const response = await apiClient.post(`/ai/sessions/${sessionId}/clear`);
    return response;
  } catch (error) {
    console.error('Clear Session Error:', error);
    throw error;
  }
};

// Default export for convenience
const chatService = {
  sendChatMessage,
  getSessions,
  getSessionHistory,
  deleteSession,
  clearSession,
};

export default chatService;
