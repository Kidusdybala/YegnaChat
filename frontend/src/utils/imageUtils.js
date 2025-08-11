/**
 * Utility functions for handling images in the YegnaChat application
 */

/**
 * Get the correct profile picture URL with fallback handling
 * @param {Object} user - User object containing profilePic
 * @returns {string|null} - Processed image URL or null if no valid image
 */
export const getProfilePictureUrl = (user) => {
  if (!user?.profilePic) return null;
  
  // Handle base64 images (from file uploads)
  if (user.profilePic.startsWith('data:image/')) {
    return user.profilePic;
  }
  
  // Handle relative URLs (from backend uploads)
  if (user.profilePic.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${baseUrl}${user.profilePic}`;
  }
  
  // Handle full URLs
  if (user.profilePic.startsWith('http')) {
    return user.profilePic;
  }
  
  // Return as-is for other cases
  return user.profilePic;
};

/**
 * Get the correct attachment URL with fallback handling
 * @param {Object} attachment - Attachment object containing asset_url
 * @returns {string|null} - Processed attachment URL or null if no valid URL
 */
export const getAttachmentUrl = (attachment) => {
  if (!attachment?.asset_url) return null;
  
  // Handle relative URLs (from backend uploads)
  if (attachment.asset_url.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${baseUrl}${attachment.asset_url}`;
  }
  
  // Handle full URLs
  if (attachment.asset_url.startsWith('http')) {
    return attachment.asset_url;
  }
  
  // Return as-is for other cases
  return attachment.asset_url;
};

/**
 * Get user initials for fallback avatar
 * @param {Object} user - User object containing name/fullName
 * @returns {string} - User initials
 */
export const getUserInitials = (user) => {
  if (!user) return '?';
  
  const name = user.fullName || user.name || '';
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Handle image load error by showing fallback
 * @param {Event} e - Image error event
 * @param {Function} onError - Optional callback for additional error handling
 */
export const handleImageError = (e, onError) => {
  e.target.style.display = 'none';
  const fallback = e.target.nextSibling;
  if (fallback) {
    fallback.style.display = 'flex';
  }
  
  if (onError && typeof onError === 'function') {
    onError(e);
  }
};
