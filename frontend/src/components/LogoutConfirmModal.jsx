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
      <div className="relative bg-base-100 rounded-2xl shadow-2xl border border-base-300 max-w-md w-full mx-4 transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-base-content">Confirm Logout</h3>
          </div>
          <button 
            onClick={onCancel}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isLoggingOut}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-base-content/80 mb-6">
            Are you sure you want to logout? You will need to sign in again to access your account.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button 
              ref={cancelButtonRef}
              onClick={onCancel}
              className="btn btn-ghost"
              disabled={isLoggingOut}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="btn btn-error gap-2"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Yes, Logout
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