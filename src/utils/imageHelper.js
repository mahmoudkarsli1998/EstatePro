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
  if (typeof filename === 'string' && (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('data:'))) {
    return filename;
  }
  
  // Handle case where filename might be an object (sanity check)
  const path = typeof filename === 'string' ? filename : (filename.url || filename.path);
  if (!path) return null;

  // Clean the path
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If already has /uploads prefix, construct without duplicating
  if (cleanPath.startsWith('/uploads/')) {
    return `${API_URL}${cleanPath}`;
  }
  
  // Standard case: just filename -> /uploads/{filename}
  return `${API_URL}/uploads${cleanPath}`;
};

// Alias for backward compatibility if needed, or we can just deprecate it
export const getImageUrl = getFullImageUrl;

// Premium Unsplash placeholders
export const UNIT_PLACEHOLDER = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format';
export const PROJECT_PLACEHOLDER = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format';
export const LOCATION_PLACEHOLDER = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80&auto=format';
export const DEVELOPER_PLACEHOLDER = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200&q=80&auto=format';

/**
 * Get placeholder image when no image available (Premium Unsplash images)
 * @param {string} type - Entity type: 'unit', 'project', 'location', 'developer'
 * @returns {string} Premium placeholder URL
 */
export const getPlaceholderImage = (type = 'default') => {
  const placeholders = {
    unit: UNIT_PLACEHOLDER,
    project: PROJECT_PLACEHOLDER,
    location: LOCATION_PLACEHOLDER,
    developer: DEVELOPER_PLACEHOLDER,
    default: UNIT_PLACEHOLDER
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
  const url = getFullImageUrl(filename);
  return url || getPlaceholderImage(type);
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
  getFirstImage,
  UNIT_PLACEHOLDER,
  PROJECT_PLACEHOLDER,
  LOCATION_PLACEHOLDER,
  DEVELOPER_PLACEHOLDER
};
