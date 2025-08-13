import { useEffect, useRef } from 'react';

/**
 * Custom hook for auto-refreshing data when user is active
 * @param {Function} refreshFn - Function to call for refresh
 * @param {number} interval - Refresh interval in milliseconds
 * @param {boolean} enabled - Whether auto-refresh is enabled
 */
export const useAutoRefresh = (refreshFn, interval = 5000, enabled = true) => {
  const intervalRef = useRef(null);
  const isVisible = useRef(true);

  useEffect(() => {
    // Track page visibility
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
      
      if (isVisible.current && enabled) {
        // Refresh immediately when tab becomes active
        refreshFn();
        startInterval();
      } else {
        stopInterval();
      }
    };

    const startInterval = () => {
      stopInterval(); // Clear any existing interval
      if (enabled && isVisible.current) {
        intervalRef.current = setInterval(refreshFn, interval);
      }
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start interval if enabled
    if (enabled) {
      startInterval();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopInterval();
    };
  }, [refreshFn, interval, enabled]);

  // Manual refresh function
  const manualRefresh = () => {
    if (typeof refreshFn === 'function') {
      refreshFn();
    }
  };

  return { manualRefresh };
};

export default useAutoRefresh;