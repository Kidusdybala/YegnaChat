// A wrapper for simple-peer to handle browser compatibility and ICE servers
import SimplePeer from 'simple-peer';

// Build ICE server list from environment with sensible defaults
function getIceServers() {
  const servers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ];

  // Optional TURN config via env (recommended for NAT traversal)
  const turnUrl = import.meta?.env?.VITE_TURN_URL;
  const turnUser = import.meta?.env?.VITE_TURN_USERNAME;
  const turnCred = import.meta?.env?.VITE_TURN_CREDENTIAL;

  if (turnUrl && turnUser && turnCred) {
    // Support comma-separated urls in VITE_TURN_URL
    const urls = turnUrl.split(',').map(u => u.trim()).filter(Boolean);
    servers.push({ urls, username: turnUser, credential: turnCred });
  }

  return servers;
}

// Create a wrapper function that initializes SimplePeer with the correct options
export function createPeer(options = {}) {
  try {
    // Default options that work well in browser environments
    const defaultOptions = {
      // We keep trickle on by default; callers can override to false if needed
      trickle: true,
      config: {
        iceServers: getIceServers(),
        // Tweak ICE gathering/connection timeouts if needed
        iceTransportPolicy: 'all',
      },
    };

    // Merge user options with defaults (user options win)
    const mergedOptions = { ...defaultOptions, ...options };

    return new SimplePeer(mergedOptions);
  } catch (error) {
    console.error('Error creating peer:', error);
    throw error;
  }
}

export const WEBRTC_SUPPORT = SimplePeer.WEBRTC_SUPPORT;