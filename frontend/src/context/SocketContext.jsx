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
      const newSocket = io(socketURL, {
        query: { userId: authUser._id },
      });

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

      // Add connection error handling
      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
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
