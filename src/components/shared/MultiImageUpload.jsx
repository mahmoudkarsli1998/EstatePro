import React, { useState } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { getImageUrl } from '../../utils/imageHelper';
import { uploadService } from '../../services/uploadService';

/**
 * MultiImageUpload - Upload and manage multiple images
 * @param {string[]} value - Array of image filenames/URLs
 * @param {function} onChange - Callback with updated array
 * @param {boolean} multiple - Allow multiple file selection
 * @param {number} maxFiles - Maximum number of files allowed
 * @param {boolean} useBackendUpload - If true, uploads to backend; if false, uses local preview
 */
const MultiImageUpload = ({ 
  value = [], 
  onChange, 
  multiple = true,
  maxFiles = 10,
  useBackendUpload = false,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check max files
    if (value.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      let newFilenames;
      
      if (useBackendUpload) {
        // Upload to backend
        const results = await uploadService.uploadMultiple(files);
        newFilenames = results.map(r => r.url || r.filename);
      } else {
        // Create local blob URLs for preview (for forms that handle upload on submit)
        newFilenames = files.map(file => URL.createObjectURL(file));
      }
      
      onChange([...value, ...newFilenames]);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
    
    // Reset input
    e.target.value = '';
  };

  const handleRemove = (index) => {
    const removed = value[index];
    // Revoke blob URL if it's a local preview
    if (removed && removed.startsWith('blob:')) {
      URL.revokeObjectURL(removed);
    }
    onChange(value.filter((_, i) => i !== index));
  };

  const getPreviewUrl = (filename) => {
    // If it's a blob URL or data URL, use as-is
    if (filename.startsWith('blob:') || filename.startsWith('data:') || filename.startsWith('http')) {
      return filename;
    }
    return getImageUrl(filename);
  };

  return (
    <div className={`multi-image-upload ${className}`}>
      {/* Preview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {value.map((filename, index) => (
          <div 
            key={index} 
            className="preview-item relative aspect-square rounded-lg overflow-hidden group border border-border/20 dark:border-white/10 bg-section dark:bg-white/5"
          >
            <img 
              src={getPreviewUrl(filename)} 
              alt={`Upload ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button 
              type="button"
              className="remove-btn absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              onClick={() => handleRemove(index)}
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded">
                Cover
              </span>
            )}
          </div>
        ))}
        
        {/* Add More Button */}
        {value.length < maxFiles && (
          <label className="add-btn aspect-square rounded-lg border-2 border-dashed border-border/40 dark:border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleChange}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <Loader size={24} className="animate-spin text-primary" />
            ) : (
              <>
                <Upload size={24} className="text-textLight mb-1" />
                <span className="text-xs text-textLight">Add</span>
              </>
            )}
          </label>
        )}
      </div>
      
      {/* Status */}
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-textLight">{value.length}/{maxFiles} images</p>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <X size={12} /> {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default MultiImageUpload;
