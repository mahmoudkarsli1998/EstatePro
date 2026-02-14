import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getFullImageUrl, getPlaceholderImage, UNIT_PLACEHOLDER } from '../../utils/imageHelper';

/**
 * ImageGallery - Displays multiple images with navigation
 * @param {string[]} images - Array of image filenames/URLs
 * @param {string} type - Entity type for placeholder: 'unit', 'project', 'location', 'developer'
 * @param {string} className - Additional CSS classes for container
 * @param {string} aspectRatio - Aspect ratio class (default: 'aspect-video')
 */
const ImageGallery = ({ 
  images = [], 
  type = 'default',
  className = '',
  aspectRatio = 'aspect-video'
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState(new Set());

  // Handle empty images array - Fallback to type-specific placeholder
  const displayImages = images && images.length > 0 ? images.filter(img => !!img) : [null];

  const handleImageError = (e, index) => {
    setFailedImages(prev => new Set([...prev, index]));
    e.target.src = getPlaceholderImage(type) || UNIT_PLACEHOLDER;
  };

  const getDisplayUrl = (filename, index) => {
    if (failedImages.has(index) || !filename) {
      return getPlaceholderImage(type);
    }
    
    // Resolve URL from various formats (string or object)
    const rawPath = typeof filename === 'string' ? filename : (filename.url || filename.path || filename.thumbnail);
    if (!rawPath) return getPlaceholderImage(type);

    return getFullImageUrl(rawPath) || getPlaceholderImage(type);
  };

  const goToPrev = () => {
    setActiveIndex(i => (i > 0 ? i - 1 : displayImages.length - 1));
  };

  const goToNext = () => {
    setActiveIndex(i => (i < displayImages.length - 1 ? i + 1 : 0));
  };

  return (
    <div className={`image-gallery ${className}`}>
      {/* Main Image */}
      <div className={`main-image relative ${aspectRatio} rounded-xl overflow-hidden bg-section dark:bg-white/5`}>
        <img
          src={getDisplayUrl(displayImages[activeIndex], activeIndex)}
          alt={`Image ${activeIndex + 1}`}
          onError={(e) => handleImageError(e, activeIndex)}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button 
              type="button"
              className="nav-btn prev absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center text-textDark dark:text-white shadow-lg hover:bg-white dark:hover:bg-black transition-colors z-10"
              onClick={goToPrev}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              type="button"
              className="nav-btn next absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center text-textDark dark:text-white shadow-lg hover:bg-white dark:hover:bg-black transition-colors z-10"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {activeIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="thumbnails flex gap-2 mt-3 overflow-x-auto pb-1">
          {displayImages.map((img, index) => (
            <button
              key={index}
              type="button"
              className={`thumbnail flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === activeIndex 
                  ? 'border-primary shadow-md' 
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              onClick={() => setActiveIndex(index)}
            >
              <img 
                src={getDisplayUrl(img, index)} 
                alt={`Thumbnail ${index + 1}`}
                onError={(e) => handleImageError(e, index)}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
