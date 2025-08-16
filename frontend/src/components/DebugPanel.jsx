import React from 'react';
import { useSocketContext } from '../context/SocketContext';
import useAuthUser from '../hooks/useAuthUser';

const DebugPanel = () => {
  const { socket, onlineUsers, debugInfo } = useSocketContext();
  const { authUser } = useAuthUser();

  // Only show in development or when needed
  const showDebug = true; // Set to false to hide

  if (!showDebug) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-base-300 p-3 rounded-lg shadow-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">🔧 Debug Info</div>
      <div className="space-y-1">
        <div>User: {authUser?.fullName || 'Not logged in'}</div>
        <div>Socket: {socket?.connected ? '✅ Connected' : '❌ Disconnected'}</div>
        <div>Socket ID: {socket?.id || 'None'}</div>
        <div>Online Users: {onlineUsers.length}</div>
        <div>Status: {debugInfo || 'Waiting...'}</div>
      </div>
    </div>
  );
};

export default DebugPanel;