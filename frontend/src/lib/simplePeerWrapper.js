// A wrapper for simple-peer to handle browser compatibility issues
import SimplePeer from 'simple-peer';

// Create a wrapper function that initializes SimplePeer with the correct options
export function createPeer(options = {}) {
  try {
    // Set default options that work well in browser environments
    const defaultOptions = {
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    };

    // Merge user options with defaults
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Create and return the peer
    return new SimplePeer(mergedOptions);
  } catch (error) {
    console.error('Error creating peer:', error);
    throw error;
  }
}

// Export other SimplePeer properties and methods
export const WEBRTC_SUPPORT = SimplePeer.WEBRTC_SUPPORT;