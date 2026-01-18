/**
 * Constructs the full URL for an uploaded file.
 * @param {string} filename - The filename returned by the API.
 * @returns {string} The full absolute URL to the image or a placeholder.
 */
export const getFullImageUrl = (filename) => {
  if (!filename) return "https://via.placeholder.com/150";
  if (filename.startsWith('http')) return filename;
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // Remove trailing slash if present
  const baseUrl = apiUrl.replace(/\/$/, '');
  
  return `${baseUrl}/uploads/${filename}`;
};
