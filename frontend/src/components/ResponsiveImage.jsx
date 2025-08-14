import React, { useState } from 'react';

const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  loading = 'lazy',
  onClick = null,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (imageError && fallback) {
    return fallback;
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-base-300 animate-pulse rounded-lg flex items-center justify-center">
          <div className="loading loading-spinner loading-sm"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        } ${onClick ? 'cursor-pointer' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        onClick={onClick}
        {...props}
      />
    </div>
  );
};

export default ResponsiveImage;