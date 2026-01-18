import apiClient from './apiClient';

export const calendarService = {
  /**
   * Get events with filters
   * @param {Object} params - Query params: startDate, endDate, type, assignedTo
   */
  getEvents: async (params = {}) => {
    const res = await apiClient.get('/calendar', { params });
    return Array.isArray(res) ? res : (res?.data || res?.items || []);
  },
  
  /**
   * Get events for a specific month
   * @param {number} year - Year (e.g., 2026)
   * @param {number} month - Month (1-12)
   */
  getMonthEvents: async (year, month) => {
    const res = await apiClient.get(`/calendar/month/${year}/${month}`);
    return Array.isArray(res) ? res : (res?.data || []);
  },
  
  /**
   * Get single event by ID
   */
  getEvent: (id) => apiClient.get(`/calendar/${id}`),
  
  /**
   * Create a new event
   * @param {Object} data - Event data: title, startDate, endDate, type, location, assignedTo
   */
  createEvent: (data) => apiClient.post('/calendar', data),
  
  /**
   * Update an event
   * @param {string} id - Event ID
   * @param {Object} data - Updated event data
   */
  updateEvent: (id, data) => apiClient.patch(`/calendar/${id}`, data),
  
  /**
   * Delete an event
   */
  deleteEvent: (id) => apiClient.delete(`/calendar/${id}`),
};
