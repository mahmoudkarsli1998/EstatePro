/**
 * Upload Service
 * Handles file uploads to the backend API
 */

import apiClient from './apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const uploadService = {
  /**
   * Upload single file
   * @param {File} file - File object from input
   * @returns {Promise<{url: string, fullUrl: string}>}
   */
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use fetch directly for FormData (axios can handle it but fetch is simpler here)
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        // Don't set Content-Type - browser sets it with boundary for FormData
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Upload failed');
    }
    
    const data = await response.json();
    // Backend returns: { url: "filename.jpg", fullUrl: "http://localhost:3000/uploads/filename.jpg" }
    return data;
  },

  /**
   * Upload multiple files
   * @param {File[]|FileList} files - Array or FileList of files
   * @returns {Promise<Array<{url: string, fullUrl: string}>>}
   */
  uploadMultiple: async (files) => {
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(file => uploadService.uploadFile(file));
    return Promise.all(uploadPromises);
  },

  /**
   * Upload multiple files and return just filenames
   * @param {File[]|FileList} files - Array or FileList of files
   * @returns {Promise<string[]>} Array of filenames
   */
  uploadMultipleGetFilenames: async (files) => {
    const results = await uploadService.uploadMultiple(files);
    return results.map(r => r.url || r.filename);
  }
};

export default uploadService;
