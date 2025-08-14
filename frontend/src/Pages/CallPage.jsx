import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';
import VideoCall from '../components/VideoCall';
import useAuthUser from '../hooks/useAuthUser';
import { userAPI } from '../lib/api';
import { useSocketContext } from '../context/SocketContext';
import toast from 'react-hot-toast';

const CallPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authUser } = useAuthUser();
  const { socket, onlineUsers } = useSocketContext();
  
  const [targetUser, setTargetUser] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [loading, setLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);

  // Get target user ID from URL params
  const targetUserId = searchParams.get('userId');

  // Fetch target user data
  useEffect(() => {
    const fetchTargetUser = async () => {
      if (!targetUserId) {
        toast.error('No user specified for call');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const userData = await userAPI.getUserById(targetUserId);
        setTargetUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user data');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchTargetUser();
  }, [targetUserId, navigate]);

  // Listen for incoming calls
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ from, name, signal }) => {
      setIncomingCall({ from, name, signal });
    };

    const handleCallEnded = () => {
      setShowVideoCall(false);
      setIncomingCall(null);
      toast.info('Call ended');
    };

    socket.on('callUser', handleIncomingCall);
    socket.on('callEnded', handleCallEnded);

    return () => {
      socket.off('callUser', handleIncomingCall);
      socket.off('callEnded', handleCallEnded);
    };
  }, [socket]);

  const handleStartCall = () => {
    if (!targetUser) {
      toast.error('Cannot start call - user data not loaded');
      return;
    }

    // Check if target user is online
    const isTargetOnline = onlineUsers.includes(targetUserId);
    if (!isTargetOnline) {
      toast.error(`${targetUser.fullName} is not online`);
      return;
    }

    setShowVideoCall(true);
  };

  const handleEndCall = () => {
    setShowVideoCall(false);
    setIncomingCall(null);
    navigate('/chat');
  };

  const handleAnswerCall = () => {
    setShowVideoCall(true);
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
    if (socket) {
      socket.emit('endCall', { userId: incomingCall.from });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content">Loading call...</p>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-base-content opacity-50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-base-content mb-2">User not found</h2>
          <button 
            onClick={() => navigate('/chat')}
            className="btn btn-primary"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  // Show video call component if call is active
  if (showVideoCall) {
    return <VideoCall targetUser={targetUser} onEndCall={handleEndCall} />;
  }

  // Show incoming call notification
  if (incomingCall) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="bg-base-200 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-primary text-primary-content flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              {incomingCall.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-base-content mb-2">
              Incoming Call
            </h2>
            <p className="text-base-content opacity-70">
              {incomingCall.name} is calling you
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={handleDeclineCall}
              className="btn btn-circle btn-lg bg-error hover:bg-error-focus text-error-content"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={handleAnswerCall}
              className="btn btn-circle btn-lg bg-success hover:bg-success-focus text-success-content"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show call initiation screen
  const isTargetOnline = onlineUsers.includes(targetUserId);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-content p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/chat')}
            className="btn btn-ghost btn-circle text-primary-content"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Video Call</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Call Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        {/* User Info */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="avatar mb-4 sm:mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-primary">
              <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-content text-2xl sm:text-3xl lg:text-4xl font-bold">
                {targetUser.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content mb-2">
            {targetUser.fullName}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isTargetOnline ? 'bg-success' : 'bg-base-300'}`}></div>
            <p className="text-sm sm:text-base text-base-content opacity-70">
              {isTargetOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-base-200 px-6 py-3 rounded-full">
            <span className="text-sm sm:text-base">
              {isTargetOnline ? 'Ready to call' : 'User is offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="bg-base-200 p-4 sm:p-6 safe-area-inset-bottom">
        <div className="flex items-center justify-center space-x-4 sm:space-x-6 lg:space-x-8 max-w-md mx-auto">
          {/* Start Video Call Button */}
          <button 
            onClick={handleStartCall}
            disabled={!isTargetOnline}
            className={`btn btn-circle btn-lg ${
              isTargetOnline 
                ? 'bg-success hover:bg-success-focus text-success-content' 
                : 'bg-base-300 text-base-content opacity-50 cursor-not-allowed'
            }`}
            title={isTargetOnline ? 'Start video call' : 'User is offline'}
          >
            <Video className="w-6 h-6" />
          </button>

          {/* Back Button */}
          <button 
            onClick={() => navigate('/chat')}
            className="btn btn-circle btn-lg bg-base-300 hover:bg-base-content hover:text-base-100"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
        
        {!isTargetOnline && (
          <p className="text-center text-sm text-base-content opacity-60 mt-4">
            {targetUser.fullName} needs to be online to receive calls
          </p>
        )}
      </div>
    </div>
  );
};

export default CallPage;