import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const MobileModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true,
  fullScreen = false,
  className = ''
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent iOS bounce scroll
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative bg-base-100 w-full max-w-lg mx-auto
        ${fullScreen 
          ? 'h-full sm:h-auto sm:max-h-[90vh] sm:rounded-lg' 
          : 'max-h-[90vh] rounded-t-2xl sm:rounded-lg'
        }
        ${className}
        safe-area-inset-bottom
        animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in-0 duration-300
      `}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-base-300 safe-area-inset-top">
            <h3 className="text-lg font-semibold text-base-content truncate">
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="btn btn-ghost btn-circle btn-sm touch-target"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className={`
          ${fullScreen ? 'flex-1 overflow-y-auto' : 'max-h-[calc(90vh-4rem)] overflow-y-auto'}
          p-4
        `}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileModal;