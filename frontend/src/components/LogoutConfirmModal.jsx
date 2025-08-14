import { useEffect, useRef } from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel, isLoggingOut }) => {
  const cancelButtonRef = useRef(null);

  // Handle keyboard events and focus management
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoggingOut) {
        onCancel();
      }
      if (e.key === 'Enter' && !isLoggingOut) {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus on cancel button when modal opens
    setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 100);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onConfirm, onCancel, isLoggingOut]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-base-100 rounded-xl sm:rounded-2xl shadow-2xl border border-base-300 max-w-sm sm:max-w-md w-full mx-3 sm:mx-4 transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-base-300">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-warning/20 rounded-full">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-base-content">Confirm Logout</h3>
          </div>
          <button 
            onClick={onCancel}
            className="btn btn-ghost btn-xs sm:btn-sm btn-circle"
            disabled={isLoggingOut}
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-base-content/80 mb-4 sm:mb-6">
            Are you sure you want to logout? You will need to sign in again to access your account.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <button 
              ref={cancelButtonRef}
              onClick={onCancel}
              className="btn btn-ghost touch-target order-2 sm:order-1"
              disabled={isLoggingOut}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="btn btn-error touch-target gap-1 sm:gap-2 order-1 sm:order-2"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="loading loading-spinner loading-xs sm:loading-sm"></span>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Yes, Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;