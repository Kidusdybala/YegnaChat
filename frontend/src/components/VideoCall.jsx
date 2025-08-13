// Add these imports at the top of the file
import { useEffect, useState, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import useAuthUser from '../hooks/useAuthUser';
import SimplePeer from 'simple-peer';

const VideoCall = ({ targetUser, onEndCall }) => {
  const { socket } = useSocketContext();
  const { authUser } = useAuthUser();
  const [stream, setStream] = useState(null);
  const [call, setCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [peer, setPeer] = useState(null);
  
  const myVideo = useRef();
  const userVideo = useRef();
  
  // Add this to your useEffect
  useEffect(() => {
    // Get user's video and audio stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
        // Show user-friendly error message
      });
  
    // Handle incoming calls
    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      socket.off('callUser');
    };
  }, []);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (remoteStream) => {
      userVideo.current.srcObject = remoteStream;
    });

    peer.signal(call.signal);
    setPeer(peer);
  };

  const callUser = () => {
    // Check if stream exists before creating the peer connection
    if (!stream) {
      console.error('Media stream is not available yet');
      return;
    }
    
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: targetUser._id,
        signalData: data,
        from: authUser._id,
        name: authUser.fullName
      });
    });

    peer.on('stream', (remoteStream) => {
      userVideo.current.srcObject = remoteStream;
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    setPeer(peer);
  };

  const endCall = () => {
    if (peer) {
      peer.destroy();
    }
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    // Reset video elements
    if (myVideo.current) {
      myVideo.current.srcObject = null;
    }
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }
    
    setCallAccepted(false);
    setCall(null);
    socket.emit('endCall', { userId: targetUser._id });
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-4xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className="w-full rounded-lg"
            />
            <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
              You
            </span>
          </div>
          {callAccepted && (
            <div className="relative">
              <video
                playsInline
                ref={userVideo}
                autoPlay
                className="w-full rounded-lg"
              />
              <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
                {targetUser.fullName}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4 mt-4">
          {!callAccepted && !call && (
            <button
              onClick={callUser}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              disabled={!stream}
            >
              Call {targetUser.fullName}
            </button>
          )}
          
          {call?.isReceivingCall && !callAccepted && (
            <button
              onClick={answerCall}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Answer Call from {call.name}
            </button>
          )}
          
         {(callAccepted || call || stream) && (
          <button
            onClick={endCall}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            End Call
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;