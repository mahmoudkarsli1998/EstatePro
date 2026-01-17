import apiClient from './apiClient';

export const locationsService = {
  /**
   * Get all locations
   */
  getLocations: async () => {
    const res = await apiClient.get('/locations');
    return Array.isArray(res) ? res : (res?.data || []);
  },

  /**
   * Get a single location by ID
   */
  getLocation: async (id) => {
    const res = await apiClient.get(`/locations/${id}`);
    return res?.data || res;
  },

  /**
   * Get projects for a location
   */
  getLocationProjects: async (id) => {
    const res = await apiClient.get(`/locations/${id}/projects`);
    return res?.data || res;
  },

  /**
   * Save (Create/Update) with FormData support
   * @param {FormData} formData - Must be a FormData object, NOT a plain JS object
   * @param {string|null} id - Location ID for update, null for create
   */
  saveLocation: async (formData, id = null) => {
    if (id) {
      const res = await apiClient.patch(`/locations/${id}`, formData);
      return res?.data || res;
    } else {
      const res = await apiClient.post('/locations', formData);
      return res?.data || res;
    }
  },

  /**
   * Create a new location (FormData)
   */
  createLocation: async (formData) => {
    const res = await apiClient.post('/locations', formData);
    return res?.data || res;
  },

  /**
   * Update a location (FormData)
   */
  updateLocation: async (id, formData) => {
    const res = await apiClient.patch(`/locations/${id}`, formData);
    return res?.data || res;
  },

  /**
   * Delete a location
   */
  deleteLocation: async (id) => {
    const res = await apiClient.delete(`/locations/${id}`);
    return res?.data || res;
  },
};
