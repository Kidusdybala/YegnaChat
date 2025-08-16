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
      toast.success('🔄 Retrying user registration...');
    }
  };

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
        <div className={onlineUsers.length === 0 ? 'text-red-500 font-bold' : ''}>
          Online Users: {onlineUsers.length}
        </div>
        <div>Status: {debugInfo || 'Waiting...'}</div>
        {onlineUsers.length === 0 && socket?.connected && (
          <button 
            onClick={retryAddUser}
            className="btn btn-xs btn-primary mt-2 w-full"
          >
            🔄 Retry Registration
          </button>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;