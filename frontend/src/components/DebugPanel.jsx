import React from 'react';
import { useSocketContext } from '../context/SocketContext';
import useAuthUser from '../hooks/useAuthUser';
import toast from 'react-hot-toast';

const DebugPanel = () => {
  const { socket, onlineUsers, debugInfo } = useSocketContext();
  const { authUser } = useAuthUser();

  const retryAddUser = () => {
    if (socket && authUser) {
      console.log('🔄 Manually retrying addUser:', authUser._id);
      socket.emit('addUser', authUser._id);
      toast.success(`🔄 Sending addUser: ${authUser._id}`);
      toast.success(`Socket connected: ${socket.connected}`);
      toast.success(`Socket ID: ${socket.id}`);
    } else {
      toast.error('❌ No socket or user available');
    }
  };

  const testConnection = () => {
    if (socket) {
      socket.emit('test', 'Hello from frontend');
      toast.success('🧪 Test event sent');
      console.log('🧪 Test connection details:');
      console.log('- Transport:', socket.io.engine.transport.name);
      console.log('- Ready state:', socket.io.engine.readyState);
      console.log('- User agent:', navigator.userAgent);
      console.log('- Is iOS:', /iPhone|iPad|iPod/.test(navigator.userAgent));
      console.log('- Is mobile:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
  };

  // Detect device type
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Only show in development or when needed
  const showDebug = true; // Set to false to hide

  if (!showDebug) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-base-300 p-3 rounded-lg shadow-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">🔧 Debug Info</div>
      <div className="space-y-1">
        <div>User: {authUser?.fullName || 'Not logged in'}</div>
        <div>Device: {isIOS ? '📱 iOS' : isAndroid ? '🤖 Android' : '💻 Desktop'}</div>
        <div>Socket: {socket?.connected ? '✅ Connected' : '❌ Disconnected'}</div>
        <div>Socket ID: {socket?.id || 'None'}</div>
        <div>Transport: {socket?.io?.engine?.transport?.name || 'N/A'}</div>
        <div className={onlineUsers.length === 0 ? 'text-red-500 font-bold' : ''}>
          Online Users: {onlineUsers.length}
        </div>
        <div>Status: {debugInfo || 'Waiting...'}</div>
        <div>API URL: {import.meta.env.VITE_API_URL}</div>
        {socket?.connected && socket?.io?.engine && (
          <div className="text-green-600">
            Ready State: {socket.io.engine.readyState}
          </div>
        )}
        {(!socket?.connected || onlineUsers.length === 0) && (
          <div className="space-y-1 mt-2">
            <button 
              onClick={retryAddUser}
              className="btn btn-xs btn-primary w-full"
            >
              🔄 Retry Registration
            </button>
            <button 
              onClick={testConnection}
              className="btn btn-xs btn-secondary w-full"
            >
              🧪 Test Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;