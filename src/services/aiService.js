import apiClient from './apiClient';

/**
 * Send a natural language query to the AI.
 * @param {string} question - The user's input question.
 * @param {boolean} [enableRag=true] - Whether to allow AI to "guess" similar projects if exact search fails.
 * @returns {Promise<Object>} - The AI response containing query, target, data, suggestions, and message.
 */
export const queryAI = async (question, enableRag = true) => {
  try {
    const response = await apiClient.post('/ai/query', {
      question,
      enableRag
    });
    
    console.log('🔍 [AI Service] Raw Response:', response);
    console.log('🔍 [AI Service] Response Keys:', Object.keys(response));
    
    // Normalize response: handle backend sending fields with extra spaces
    // e.g., " explanation" instead of "explanation"
    const normalized = {};
    Object.keys(response).forEach(key => {
      const trimmedKey = key.trim();
      normalized[trimmedKey] = response[key];
      
      // Log each key transformation
      if (key !== trimmedKey) {
        console.log(`🔧 [AI Service] Normalized key: "${key}" -> "${trimmedKey}"`);
      }
    });
    
    // Ensure 'message' field exists (use explanation as fallback)
    if (!normalized.message && normalized.explanation) {
      console.log('✅ [AI Service] Using explanation as message:', normalized.explanation);
      normalized.message = normalized.explanation;
    }
    
    console.log('📤 [AI Service] Final Normalized Response:', normalized);
    console.log('📤 [AI Service] Final Message:', normalized.message);
    
   return normalized;
  } catch (error) {
    console.error('AI Query Error:', error);
    throw error;
  }
}

/**
 * Trigger AI reindexing (RAG update).
 * @returns {Promise<Object>} - The reindexing results.
 */
export const reindexAi = async () => {
  try {
    const response = await apiClient.post('/ai/reindex');
    return response;
  } catch (error) {
    console.error('AI Reindex Error:', error);
    throw error;
  }
};
