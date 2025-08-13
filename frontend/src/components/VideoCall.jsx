import { useEffect, useState, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import useAuthUser from '../hooks/useAuthUser';
import { createPeer } from '../lib/simplePeerWrapper';

const VideoCall = ({ targetUser, onEndCall }) => {
  const { socket } = useSocketContext();
  const { authUser } = useAuthUser();
  const [stream, setStream] = useState(null);
  const [call, setCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [peer, setPeer] = useState(null);
  
  const myVideo = useRef();
  const userVideo = useRef();
  
  // Initialize media stream
  useEffect(() => {
    let currentStream = null;
    
    // Get user's video and audio stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        currentStream = mediaStream;
        setStream(mediaStream);
        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
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
  
    // Cleanup function - runs when component unmounts
    return () => {
      // Stop current stream if it exists
      if (currentStream) {
        currentStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      // Also stop the stream from state if different
      if (stream && stream !== currentStream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
      socket.off('callUser');
      socket.off('callAccepted');
    };
  }, []);

  // Additional cleanup effect for component unmount
  useEffect(() => {
    return () => {
      console.log('VideoCall component unmounting, cleaning up...');
      // Stop all tracks in the current stream
      if (stream) {
        stream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      }
    };
  }, [stream]);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = createPeer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
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
    
    const peer = createPeer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: targetUser._id,
        signalData: data,
        from: authUser._id,
        name: authUser.fullName
      });
    });

    peer.on('stream', (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    // Remove any existing 'callAccepted' listeners to prevent duplicates
    socket.off('callAccepted');
    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    setPeer(peer);
  };

  const endCall = () => {
    console.log('Ending call and cleaning up resources...');
    
    // Destroy peer connection
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    
    // Stop all media tracks immediately
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.readyState);
        track.stop();
      });
      setStream(null);
    }
    
    // Reset video elements and clear their sources
    if (myVideo.current) {
      myVideo.current.srcObject = null;
      myVideo.current.pause();
    }
    if (userVideo.current) {
      userVideo.current.srcObject = null;
      userVideo.current.pause();
    }
    
    // Reset call states
    setCallAccepted(false);
    setCall(null);
    
    // Notify socket about call end
    socket.emit('endCall', { userId: targetUser._id });
    
    // Remove any lingering socket listeners
    socket.off('callAccepted');
    
    // Call parent component's onEndCall
    onEndCall();
    
    console.log('Call cleanup completed');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-lg w-full max-w-4xl shadow-2xl border border-base-300">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className="w-full rounded-lg shadow-md bg-base-200"
            />
            <span className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">
              You
            </span>
          </div>
          {callAccepted ? (
            <div className="relative">
              <video
                playsInline
                ref={userVideo}
                autoPlay
                className="w-full rounded-lg shadow-md bg-base-200"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">
                {targetUser.fullName}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-base-200 rounded-lg">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold">
                    {targetUser.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <p className="text-base-content font-medium">{targetUser.fullName}</p>
                <p className="text-base-content opacity-60 text-sm">
                  {call?.isReceivingCall ? 'Incoming call...' : 'Waiting to connect...'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4">
          {!callAccepted && !call && (
            <button
              onClick={callUser}
              className="btn btn-primary px-8 py-3 rounded-lg font-medium"
              disabled={!stream}
            >
              📹 Call {targetUser.fullName}
            </button>
          )}
          
          {call?.isReceivingCall && !callAccepted && (
            <button
              onClick={answerCall}
              className="btn btn-success px-8 py-3 rounded-lg font-medium"
            >
              📞 Answer Call from {call.name}
            </button>
          )}
          
         {(callAccepted || call || stream) && (
          <button
            onClick={endCall}
            className="btn btn-error px-8 py-3 rounded-lg font-medium"
          >
            📵 End Call
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;