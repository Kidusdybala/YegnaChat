// Emergency Socket.io connection fix
// Add this to reduce connection issues until deployment works

if (window.io) {
  console.log('🔧 Applying emergency Socket.io fixes...');
  
  // Override aggressive reconnection settings
  const originalConnect = window.io;
  window.io = function(url, opts = {}) {
    console.log('🔧 Patching Socket.io config...');
    
    // Force stable settings
    const patchedOpts = {
      ...opts,
      forceNew: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 15000,
      transports: ['polling', 'websocket']
    };
    
    console.log('🔧 Patched config:', patchedOpts);
    return originalConnect(url, patchedOpts);
  };
}

// Reduce toast spam
if (window.toast) {
  const originalToast = window.toast;
  let lastToast = '';
  let toastCount = 0;
  
  window.toast = {
    ...originalToast,
    success: (msg) => {
      if (msg.includes('Connected') || msg.includes('users online')) {
        if (lastToast === msg) {
          toastCount++;
          if (toastCount > 2) return; // Skip repeated messages
        } else {
          toastCount = 0;
        }
        lastToast = msg;
      }
      return originalToast.success(msg);
    }
  };
}