/**
 * Mobile-specific utility functions for YegnaChat
 */

/**
 * Check if the device is mobile based on screen width
 * @returns {boolean} - True if mobile device
 */
export const isMobileDevice = () => {
  return window.innerWidth < 768; // md breakpoint
};

/**
 * Check if the device is touch-enabled
 * @returns {boolean} - True if touch device
 */
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get safe area insets for devices with notches
 * @returns {Object} - Safe area inset values
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: style.getPropertyValue('env(safe-area-inset-top)') || '0px',
    bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
    left: style.getPropertyValue('env(safe-area-inset-left)') || '0px',
    right: style.getPropertyValue('env(safe-area-inset-right)') || '0px',
  };
};

/**
 * Prevent body scroll (useful for modals on mobile)
 * @param {boolean} prevent - Whether to prevent scroll
 */
export const preventBodyScroll = (prevent = true) => {
  if (prevent) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  } else {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }
};

/**
 * Get optimal image size for mobile devices
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {number} maxSize - Maximum size for mobile (default: 400)
 * @returns {Object} - Optimized dimensions
 */
export const getOptimalImageSize = (originalWidth, originalHeight, maxSize = 400) => {
  if (!isMobileDevice()) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;
  
  if (originalWidth > originalHeight) {
    return {
      width: Math.min(originalWidth, maxSize),
      height: Math.min(originalWidth, maxSize) / aspectRatio
    };
  } else {
    return {
      width: Math.min(originalHeight, maxSize) * aspectRatio,
      height: Math.min(originalHeight, maxSize)
    };
  }
};

/**
 * Add haptic feedback on supported devices
 * @param {string} type - Type of haptic feedback ('light', 'medium', 'heavy')
 */
export const addHapticFeedback = (type = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    navigator.vibrate(patterns[type] || patterns.light);
  }
};

/**
 * Check if device is in landscape mode
 * @returns {boolean} - True if landscape
 */
export const isLandscape = () => {
  return window.innerWidth > window.innerHeight;
};

/**
 * Get device pixel ratio for high-DPI displays
 * @returns {number} - Device pixel ratio
 */
export const getDevicePixelRatio = () => {
  return window.devicePixelRatio || 1;
};

/**
 * Optimize touch target size
 * @param {HTMLElement} element - Element to optimize
 * @param {number} minSize - Minimum touch target size (default: 44px)
 */
export const optimizeTouchTarget = (element, minSize = 44) => {
  if (!element || !isTouchDevice()) return;
  
  const rect = element.getBoundingClientRect();
  if (rect.width < minSize || rect.height < minSize) {
    element.style.minWidth = `${minSize}px`;
    element.style.minHeight = `${minSize}px`;
  }
};

/**
 * Handle mobile keyboard visibility
 * @param {Function} onShow - Callback when keyboard shows
 * @param {Function} onHide - Callback when keyboard hides
 */
export const handleMobileKeyboard = (onShow, onHide) => {
  if (!isMobileDevice()) return;

  let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
  
  const handleViewportChange = () => {
    const currentHeight = window.visualViewport?.height || window.innerHeight;
    const heightDifference = initialViewportHeight - currentHeight;
    
    if (heightDifference > 150) { // Keyboard is likely open
      onShow && onShow(heightDifference);
    } else {
      onHide && onHide();
    }
  };

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportChange);
    return () => window.visualViewport.removeEventListener('resize', handleViewportChange);
  } else {
    window.addEventListener('resize', handleViewportChange);
    return () => window.removeEventListener('resize', handleViewportChange);
  }
};

/**
 * Smooth scroll to element with mobile optimization
 * @param {HTMLElement|string} element - Element or selector to scroll to
 * @param {Object} options - Scroll options
 */
export const smoothScrollTo = (element, options = {}) => {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (!target) return;

  const defaultOptions = {
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
    ...options
  };

  // On mobile, add some offset for better visibility
  if (isMobileDevice()) {
    const offset = options.mobileOffset || 20;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: defaultOptions.behavior
    });
  } else {
    target.scrollIntoView(defaultOptions);
  }
};