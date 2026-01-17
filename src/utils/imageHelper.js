/**
 * Image Helper Utilities
 * Constructs full image URLs from filenames stored in the database
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Constructs full image URL from filename
 * @param {string} filename - The image filename stored in DB
 * @returns {string|null} Full URL to access the image
 */
/**
 * Constructs full image URL from filename
 * @param {string} filename - The image filename stored in DB
 * @returns {string|null} Full URL to access the image
 */
export const getFullImageUrl = (filename) => {
  if (!filename) return null;
  
  // If already a full URL (http/https or data URI), return as-is
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('data:')) {
    return filename;
  }
  
  // If already has /uploads prefix, construct without duplicating
  if (filename.startsWith('/uploads/')) {
    return `${API_URL}${filename}`;
  }
  
  // If starts with /, it's a relative path, might not be uploads but we serve static there usually
  if (filename.startsWith('/')) {
    return `${API_URL}${filename}`;
  }
  
  // Standard case: just filename -> /uploads/{filename}
  return `${API_URL}/uploads/${filename}`;
};

// Alias for backward compatibility if needed, or we can just deprecate it
export const getImageUrl = getFullImageUrl;

/**
 * Get placeholder image when no image available
 * @param {string} type - Entity type: 'unit', 'project', 'location', 'developer', 'default'
 * @returns {string} Path to placeholder image
 */
export const getPlaceholderImage = (type = 'default') => {
  const placeholders = {
    unit: '/images/placeholder-unit.svg',
    project: '/images/placeholder-project.svg',
    location: '/images/placeholder-location.svg',
    developer: '/images/placeholder-logo.svg',
    default: '/images/placeholder.svg'
  };
  return placeholders[type] || placeholders.default;
};

/**
 * Get image URL with fallback to placeholder
 * @param {string} filename - The image filename
 * @param {string} type - Entity type for placeholder
 * @returns {string} Image URL or placeholder
 */
export const getImageWithFallback = (filename, type = 'default') => {
  return getFullImageUrl(filename) || getPlaceholderImage(type);
};

/**
 * Get first image from an array with fallback
 * @param {string[]} images - Array of image filenames
 * @param {string} type - Entity type for placeholder  
 * @returns {string} First image URL or placeholder
 */
export const getFirstImage = (images, type = 'default') => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return getPlaceholderImage(type);
  }
  return getImageWithFallback(images[0], type);
};

export default {
  getFullImageUrl,
  getImageUrl,
  getPlaceholderImage,
  getImageWithFallback,
  getFirstImage
};
