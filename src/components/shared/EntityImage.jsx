import React, { useState } from 'react';
import { getImageWithFallback, getPlaceholderImage, UNIT_PLACEHOLDER } from '../../utils/imageHelper';

/**
 * EntityImage - Displays a single image with error handling and fallback
 * @param {string} src - Image filename or URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} type - Entity type for placeholder: 'unit', 'project', 'location', 'developer', 'default'
 * @param {string} className - Additional CSS classes
 */
const EntityImage = ({ 
  src, 
  alt = 'Image', 
  type = 'default',
  className = '',
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  
  const imageUrl = hasError 
    ? getPlaceholderImage(type) 
    : (src ? getImageWithFallback(src, type) : getPlaceholderImage(type));

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`entity-image ${className}`}
      onError={(e) => {
        setHasError(true);
        e.target.src = getPlaceholderImage(type) || UNIT_PLACEHOLDER;
      }}
      loading="lazy"
      {...props}
    />
  );
};

export default EntityImage;
