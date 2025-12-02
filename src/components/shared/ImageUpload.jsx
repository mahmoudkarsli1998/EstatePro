import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { storage } from '../../utils/storage';

const ImageUpload = ({ onUpload, initialImage = null, className = '' }) => {
  const [preview, setPreview] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const url = await storage.uploadImage(file);
      setPreview(url);
      onUpload(url);
    } catch (err) {
      setError(err);
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    onUpload(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-4 transition-all duration-200
          flex flex-col items-center justify-center min-h-[200px] cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}
          ${error ? 'border-red-500/50 bg-red-500/5' : ''}
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center text-primary animate-pulse">
            <Loader size={32} className="animate-spin mb-2" />
            <span className="text-sm font-medium">Uploading...</span>
          </div>
        ) : preview ? (
          <div className="relative w-full h-full min-h-[180px] group">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover rounded-lg absolute inset-0"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
              <p className="text-white font-medium">Click or Drop to Replace</p>
            </div>
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:bg-red-600"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Upload size={24} />
            </div>
            <p className="text-sm font-medium text-white mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400 flex items-center">
          <X size={12} className="mr-1" /> {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
