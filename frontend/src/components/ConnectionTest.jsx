import React, { useState, useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';
import useAuthUser from '../hooks/useAuthUser';
import toast from 'react-hot-toast';

const ConnectionTest = () => {
  const { socket, onlineUsers } = useSocketContext();
  const { authUser } = useAuthUser();
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev.slice(-9), { message, type, timestamp }]);
  };

  useEffect(() => {
    if (!socket) {
      setConnectionStatus('❌ No socket instance');
      return;
    }

    if (socket.connected) {
      setConnectionStatus('✅ Connected');
      addTestResult('Socket connected successfully', 'success');
    } else {
      setConnectionStatus('🔄 Connecting...');
      addTestResult('Attempting to connect...', 'info');
    }
  }, [socket?.connected]);

  const runConnectionTest = () => {
    addTestResult('🧪 Starting connection test...', 'info');
    
    // Test 1: Check socket exists
    if (!socket) {
      addTestResult('❌ No socket instance found', 'error');
      return;
    }
    addTestResult('✅ Socket instance exists', 'success');

    // Test 2: Check connection status
    if (socket.connected) {
      addTestResult('✅ Socket is connected', 'success');
    } else {
      addTestResult('❌ Socket is not connected', 'error');
    }

    // Test 3: Check transport method
    if (socket.io?.engine?.transport?.name) {
      addTestResult(`✅ Transport: ${socket.io.engine.transport.name}`, 'success');
    } else {
      addTestResult('❌ No transport information available', 'error');
    }

    // Test 4: Test communication
    if (socket.connected) {
      socket.emit('test', 'Connection test from ' + (authUser?.fullName || 'Unknown'));
      addTestResult('✅ Test message sent to server', 'success');
    }

    // Test 5: Check user registration
    if (onlineUsers.length > 0) {
      addTestResult(`✅ ${onlineUsers.length} users online`, 'success');
    } else {
      addTestResult('⚠️ No online users detected', 'warning');
    }

    // Test 6: Device information
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const deviceType = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop';
    addTestResult(`📱 Device: ${deviceType}`, 'info');

    // Test 7: API URL
    const apiUrl = import.meta.env.VITE_API_URL;
    addTestResult(`🌐 API URL: ${apiUrl}`, 'info');

    toast.success('Connection test completed! Check results below.');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const retryConnection = () => {
    addTestResult('🔄 Attempting manual user registration...', 'info');
    if (socket && authUser) {
      socket.emit('addUser', authUser._id);
      addTestResult(`✅ Sent addUser with ID: ${authUser._id}`, 'success');
    } else {
      addTestResult('❌ Cannot retry - no socket or auth user', 'error');
    }
  };

  return (
    <div className="p-4 bg-base-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔧 Connection Test</h3>
      
      <div className="mb-4">
        <div className="text-sm">Status: <span className="font-bold">{connectionStatus}</span></div>
        <div className="text-sm">Online Users: <span className="font-bold text-green-600">{onlineUsers.length}</span></div>
        <div className="text-sm">User ID: <span className="font-bold">{authUser?._id || 'Not logged in'}</span></div>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={runConnectionTest}
          className="btn btn-primary btn-sm"
        >
          🧪 Run Test
        </button>
        <button 
          onClick={retryConnection}
          className="btn btn-secondary btn-sm"
        >
          🔄 Retry Registration
        </button>
        <button 
          onClick={clearResults}
          className="btn btn-ghost btn-sm"
        >
          🗑️ Clear
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-base-100 p-3 rounded max-h-60 overflow-y-auto">
          <h4 className="font-bold text-sm mb-2">Test Results:</h4>
          {testResults.map((result, index) => (
            <div 
              key={index} 
              className={`text-xs mb-1 ${
                result.type === 'success' ? 'text-green-600' :
                result.type === 'error' ? 'text-red-600' :
                result.type === 'warning' ? 'text-yellow-600' :
                'text-base-content'
              }`}
            >
              <span className="text-gray-500">[{result.timestamp}]</span> {result.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;