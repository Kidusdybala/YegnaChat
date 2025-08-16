import { createContext, useState, useEffect, useContext, useCallback } from "react";
import useAuthUser from "../hooks/useAuthUser";
import io from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  // Function to refresh unread counts
  const refreshUnreadCounts = useCallback(() => {
    // Invalidate the unread messages query to trigger a refetch
    queryClient.invalidateQueries(["unreadMessages"]);
    
    // Invalidate the notifications query to trigger a refetch
    queryClient.invalidateQueries(["notifications"]);
    
    // Invalidate the friend requests query to trigger a refetch
    queryClient.invalidateQueries(["friendRequests"]);
    
    // Invalidate the chats query to refresh the chat list
    queryClient.invalidateQueries(["chats"]);
  }, [queryClient]);

  useEffect(() => {
    if (authUser) {
      const socketURL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5001";
      console.log("🔌 Connecting to Socket.io server:", socketURL);
      console.log("🔌 User agent:", navigator.userAgent);
      
      // Detect iOS device
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      console.log("🔌 iOS device detected:", isIOS);
      
      const socketConfig = {
        query: { userId: authUser._id },
        // Force polling first for iOS, allow both for others
        transports: isIOS ? ['polling'] : ['polling', 'websocket'],
        // Increase timeout for mobile networks
        timeout: isIOS ? 30000 : 20000,
        // Enable polling for better iOS compatibility
        forceNew: true,
        // Reconnection settings - more aggressive for iOS
        reconnection: true,
        reconnectionAttempts: isIOS ? 10 : 5,
        reconnectionDelay: isIOS ? 2000 : 1000,
        reconnectionDelayMax: isIOS ? 10000 : 5000,
        // Add headers for better compatibility
        extraHeaders: {
          "User-Agent": navigator.userAgent
        },
        // iOS-specific settings
        ...(isIOS && {
          upgrade: false, // Disable websocket upgrade for iOS
          rememberUpgrade: false,
          jsonp: false
        })
      };
      
      console.log("🔌 Socket config:", socketConfig);
      
      const newSocket = io(socketURL, socketConfig);

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("🔌 Socket connected successfully");
        console.log("🔌 Socket ID:", newSocket.id);
        setDebugInfo(`✅ Socket connected: ${newSocket.id}`);
        toast.success("🔌 Socket connected!");
        
        // Now that we're connected, add the user
        console.log("🔌 Adding user to socket:", authUser._id, authUser.fullName);
        newSocket.emit("addUser", authUser._id);
      });

      newSocket.on("getOnlineUsers", (users) => {
        console.log("👥 Online users updated:", users);
        setOnlineUsers(users);
        setDebugInfo(`👥 Online users: ${users.length}`);
        toast.success(`👥 ${users.length} users online`);
      });

      // Listen for new messages
      newSocket.on("getMessage", (data) => {
        // Refresh unread counts
        refreshUnreadCounts();
        
        // Show notification for new message if not from current user
        if (data.senderId !== authUser._id) {
          toast.success(`New message from ${data.senderName || 'someone'}`);
        }
      });
      
      // Listen for friend request notifications
      newSocket.on("getFriendRequest", (data) => {
        // Refresh notifications
        refreshUnreadCounts();
        
        // Show notification
        toast.success(`New friend request from ${data.senderName || 'someone'}`);
      });
      
      // Listen for accepted friend requests
      newSocket.on("getFriendAccepted", (data) => {
        // Refresh notifications
        refreshUnreadCounts();
        
        // Show notification
        toast.success(`${data.accepterName || 'Someone'} accepted your friend request`);
      });

      // Listen for incoming calls globally
      newSocket.on("callUser", ({ from, name, signal }) => {
        console.log("📞 Incoming call from:", name, "ID:", from);
        setIncomingCall({ from, name, signal });
        setDebugInfo(`📞 Incoming call from ${name}`);
        
        // Show notification
        toast.success(`📞 Incoming call from ${name}`, {
          duration: 10000, // Show for 10 seconds
          icon: '📞'
        });
      });

      // Listen for call ended
      newSocket.on("callEnded", () => {
        console.log("📞 Call ended");
        setIncomingCall(null);
        toast.info("Call ended");
      });

      // Enhanced connection error handling for iOS debugging
      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error description:", error.description);
        console.error("❌ Error context:", error.context);
        console.error("❌ Error type:", error.type);
        setDebugInfo(`❌ Connection error: ${error.message || error.type}`);
        toast.error(`❌ Connection failed: ${error.message || 'Network error'}`);
      });

      // Add disconnect handling
      newSocket.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected, reason:", reason);
        setDebugInfo(`🔌 Disconnected: ${reason}`);
        toast.error(`🔌 Disconnected: ${reason}`);
      });

      // Add reconnection attempt logging
      newSocket.on("reconnect_attempt", (attemptNumber) => {
        console.log("🔄 Reconnection attempt:", attemptNumber);
        setDebugInfo(`🔄 Reconnecting... (attempt ${attemptNumber})`);
        toast.info(`🔄 Reconnecting... (attempt ${attemptNumber})`);
      });

      // Add reconnection success
      newSocket.on("reconnect", (attemptNumber) => {
        console.log("✅ Reconnected after", attemptNumber, "attempts");
        setDebugInfo(`✅ Reconnected after ${attemptNumber} attempts`);
        toast.success(`✅ Reconnected!`);
        // Re-add user after reconnection
        newSocket.emit("addUser", authUser._id);
      });

      // Add reconnection failure
      newSocket.on("reconnect_failed", () => {
        console.error("❌ Reconnection failed");
        setDebugInfo("❌ Reconnection failed");
        toast.error("❌ Unable to reconnect");
      });



      return () => {
        newSocket.off("callUser");
        newSocket.off("callEnded");
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [authUser, refreshUnreadCounts]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      onlineUsers,
      incomingCall,
      setIncomingCall,
      debugInfo,
      refreshUnreadCounts
    }}>
      {children}
    </SocketContext.Provider>
  );
};
