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
  const [connectionState, setConnectionState] = useState('disconnected');
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
        // Start with polling, allow WebSocket upgrade if stable
        transports: ['polling', 'websocket'],
        // Much longer timeout for proxy environments
        timeout: 60000,
        // Enable new connections to avoid session issues
        forceNew: true,
        // Aggressive reconnection settings
        reconnection: true,
        reconnectionAttempts: 8,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        // Allow WebSocket upgrade but don't force it
        upgrade: true,
        rememberUpgrade: false, // Don't remember to avoid session issues
        // Disable features that might cause proxy issues
        jsonp: false,
        // Add explicit path
        path: '/socket.io/',
        // iOS-specific settings (if needed)
        ...(isIOS && {
          // Even on iOS, allow upgrade since polling is problematic
          forceJSONP: false
        })
      };
      
      console.log("🔌 Socket config:", socketConfig);
      
      const newSocket = io(socketURL, socketConfig);

      setSocket(newSocket);

      // Enhanced connection event with transport debugging
      newSocket.on("connect", () => {
        console.log("🔌 Socket connected successfully");
        console.log("🔌 Socket ID:", newSocket.id);
        console.log("🔌 Transport:", newSocket.io.engine.transport.name);
        console.log("🔌 Ready state:", newSocket.io.engine.readyState);
        console.log("🔌 Engine.IO version:", newSocket.io.engine.protocol);
        
        setDebugInfo(`✅ Socket connected (${newSocket.io.engine.transport.name}): ${newSocket.id}`);
        toast.success(`🔌 Socket connected via ${newSocket.io.engine.transport.name}!`);
        
        // Now that we're connected, add the user
        console.log("🔌 Adding user to socket:", authUser._id, authUser.fullName);
        newSocket.emit("addUser", authUser._id);
      });

      // Enhanced transport events for debugging
      newSocket.io.on("ping", () => {
        console.log("🏓 Socket ping");
      });

      newSocket.io.on("pong", (latency) => {
        console.log(`🏓 Socket pong - latency: ${latency}ms`);
      });

      newSocket.io.engine.on("upgrade", () => {
        console.log("⬆️ Transport upgraded to:", newSocket.io.engine.transport.name);
        setDebugInfo(`⬆️ Upgraded to: ${newSocket.io.engine.transport.name}`);
      });

      newSocket.io.engine.on("upgradeError", (error) => {
        console.log("⬆️ Transport upgrade error:", error);
        setDebugInfo(`⚠️ Upgrade error: ${error.message || 'Unknown'}`);
      });

      newSocket.on("getOnlineUsers", (users) => {
        console.log("👥 Online users updated:", users);
        setOnlineUsers(users);
        setDebugInfo(prev => `✅ Connected | 👥 Online: ${users.length}`);
        // Don't show toast for online users updates - too spammy
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
