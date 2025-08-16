import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff } from 'lucide-react';
import { useSocketContext } from '../context/SocketContext';

const IncomingCallModal = () => {
  const navigate = useNavigate();
  const { socket, incomingCall, setIncomingCall } = useSocketContext();

  if (!incomingCall) return null;

  const handleAnswerCall = () => {
    // Navigate to call page with the caller's ID
    navigate(`/call?userId=${incomingCall.from}`);
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    // Notify the caller that call was declined
    if (socket) {
      socket.emit('endCall', { userId: incomingCall.from });
    }
    setIncomingCall(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="bg-base-100 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4 animate-pulse">
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

        <div className="flex justify-center gap-8">
          <button
            onClick={handleDeclineCall}
            className="btn btn-circle btn-lg bg-error hover:bg-error-focus text-error-content animate-bounce"
            title="Decline call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          <button
            onClick={handleAnswerCall}
            className="btn btn-circle btn-lg bg-success hover:bg-success-focus text-success-content animate-bounce"
            title="Answer call"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-base-content opacity-60 mt-4">
          Tap to answer or decline
        </p>
      </div>
    </div>
  );
};

export default IncomingCallModal;