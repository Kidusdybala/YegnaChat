import React from 'react';

const MobileLoader = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'loading-xs',
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg'
  };

  const LoaderContent = () => (
    <div className={`flex flex-col items-center justify-center gap-3 sm:gap-4 ${className}`}>
      <div className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></div>
      {text && (
        <p className="text-sm sm:text-base text-base-content opacity-70 text-center">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-base-100 flex items-center justify-center z-50 safe-area-inset-top safe-area-inset-bottom">
        <LoaderContent />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6 sm:p-8">
      <LoaderContent />
    </div>
  );
};

export default MobileLoader;