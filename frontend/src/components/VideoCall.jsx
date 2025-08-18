import { useEffect, useState, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import useAuthUser from '../hooks/useAuthUser';
import { createPeer } from '../lib/simplePeerWrapper';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import toast from 'react-hot-toast';

const VideoCall = ({ targetUser, onEndCall, autoCall = false }) => {
  const { socket, incomingCall, setIncomingCall } = useSocketContext();
  const { authUser } = useAuthUser();
  const [stream, setStream] = useState(null);
  const [call, setCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [peer, setPeer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  
  // Initialize media stream
  useEffect(() => {
    let currentStream = null;
    
    // Get user's video and audio stream with fallback options
    const getMediaStream = async () => {
      try {
        // Try video + audio first
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        currentStream = mediaStream;
        setStream(mediaStream);
        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
        }

      } catch (error) {
        try {
          // Fallback to audio only
          const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          currentStream = audioStream;
          setStream(audioStream);
          toast.info('Camera unavailable - using audio only');
        } catch (audioError) {
          toast.error('Cannot access camera or microphone. Please check permissions and close other apps using these devices.');
        }
      }
    };

    getMediaStream();
  
    // Check if there's a global incoming call for this user
    if (incomingCall && incomingCall.from === targetUser._id) {
      setCall({ isReceivingCall: true, from: incomingCall.from, name: incomingCall.name, signal: incomingCall.signal });
      // Clear the global incoming call since we're handling it
      setIncomingCall(null);
    }

    // Handle call ended by other user
    socket.on('callEnded', () => {
      endCall();
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
      socket.off('callAccepted');
      socket.off('callEnded');
    };
  }, []);

  // Additional cleanup effect for component unmount
  useEffect(() => {
    return () => {
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

  // Auto-call effect when autoCall is true and stream is ready
  useEffect(() => {
    if (autoCall && stream && !call && !callAccepted) {
      console.log('🤖 Auto-calling user:', targetUser.fullName);
      // Small delay to ensure stream is fully ready
      const timer = setTimeout(() => {
        callUser();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoCall, stream, call, callAccepted]);

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

    peer.on('error', (err) => {
      console.error('Peer connection error:', err);
      toast.error('Connection error occurred');
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
    
    console.log('📞 Initiating call to:', targetUser.fullName, 'ID:', targetUser._id);
    
    const peer = createPeer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      console.log('📞 Sending call signal to server');
      toast.success(`📞 Calling ${targetUser.fullName}...`);
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

    peer.on('error', (err) => {
      console.error('Peer connection error:', err);
      toast.error('Connection error occurred');
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
    // Destroy peer connection
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    
    // Stop all media tracks immediately
    if (stream) {
      stream.getTracks().forEach(track => {
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
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video on/off
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-base-100 p-4 sm:p-6 rounded-lg w-full max-w-6xl h-full max-h-[90vh] shadow-2xl border border-base-300 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-base-content">
            {callAccepted ? `In call with ${targetUser.fullName}` : 'Video Call'}
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${callAccepted ? 'bg-success animate-pulse' : 'bg-warning'}`}></div>
            <span className="text-sm text-base-content opacity-70">
              {callAccepted ? 'Connected' : call?.isReceivingCall ? 'Incoming call...' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* My Video */}
          <div className="relative bg-base-200 rounded-lg overflow-hidden">
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className="w-full h-full object-cover"
              style={{ display: stream?.getVideoTracks()?.length > 0 && !isVideoOff ? 'block' : 'none' }}
            />
            {/* Show placeholder when no video */}
            {(!stream || stream.getVideoTracks()?.length === 0 || isVideoOff) && (
              <div className="w-full h-full flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center mx-auto mb-3 text-3xl font-bold">
                    {authUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <p className="text-sm text-base-content opacity-70">
                    {isVideoOff ? 'Camera Off' : 'Audio Only'}
                  </p>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">
              You {(!stream || stream.getVideoTracks()?.length === 0 || isVideoOff) && '(Audio Only)'}
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative bg-base-200 rounded-lg overflow-hidden">
            {callAccepted ? (
              <>
                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">
                  {targetUser.fullName}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center mx-auto mb-3 text-3xl font-bold">
                    {targetUser.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <p className="text-base-content font-medium text-lg">{targetUser.fullName}</p>
                  <p className="text-base-content opacity-60 text-sm mt-1">
                    {call?.isReceivingCall ? 'Incoming call...' : 'Waiting to connect...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Call Controls */}
        <div className="flex justify-center items-center gap-4">
          {!callAccepted && !call && (
            <button
              onClick={callUser}
              className="btn btn-success btn-lg px-8 rounded-full font-medium"
              disabled={!stream}
            >
              📹 Call {targetUser.fullName}
            </button>
          )}
          
          {call?.isReceivingCall && !callAccepted && (
            <button
              onClick={answerCall}
              className="btn btn-success btn-lg px-8 rounded-full font-medium animate-pulse"
            >
              📞 Answer Call
            </button>
          )}
          
          {/* Call Controls - Show when call is active */}
          {(callAccepted || call) && (
            <>
              {/* Mute/Unmute Button */}
              <button
                onClick={toggleMute}
                className={`btn btn-circle btn-lg ${
                  isMuted ? 'bg-error text-error-content' : 'bg-base-300 hover:bg-base-content hover:text-base-100'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {/* Video On/Off Button */}
              <button
                onClick={toggleVideo}
                className={`btn btn-circle btn-lg ${
                  isVideoOff ? 'bg-error text-error-content' : 'bg-base-300 hover:bg-base-content hover:text-base-100'
                }`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            </>
          )}

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="btn btn-circle btn-lg bg-error hover:bg-error-focus text-error-content"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;