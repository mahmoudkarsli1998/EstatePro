/**
 * Storage Service
 * Handles file uploads and validation.
 * Currently simulates uploads for MVP but structured for S3 integration.
 */

export const storage = {
  /**
   * Validates a file before upload
   * @param {File} file 
   * @returns {Object} { valid: boolean, error: string }
   */
  validateFile: (file) => {
    const MAX_SIZE_MB = 5;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.' };
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${MAX_SIZE_MB}MB limit.` };
    }

    return { valid: true };
  },

  /**
   * Uploads an image
   * @param {File} file 
   * @returns {Promise<string>} URL of the uploaded image
   */
  uploadImage: (file) => {
    return new Promise((resolve, reject) => {
      const validation = storage.validateFile(file);
      if (!validation.valid) {
        reject(validation.error);
        return;
      }

      // SIMULATION: In a real app, this would:
      // 1. Request a pre-signed URL from API
      // 2. PUT the file to S3
      // 3. Return the public URL
      
      // For MVP/Demo, we use FileReader to create a local data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simulate network delay
        setTimeout(() => {
          resolve(reader.result);
        }, 1000);
      };
      reader.onerror = () => reject('Failed to read file');
      reader.readAsDataURL(file);
    });
  }
};
