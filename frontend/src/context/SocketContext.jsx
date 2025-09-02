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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const socketUrl = API_URL.replace('/api', ''); // Remove /api suffix for socket connection

      const newSocket = io(socketUrl, {
        query: { userId: authUser._id },
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 500,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      setSocket(newSocket);

      newSocket.emit("addUser", authUser._id);

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
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

      // Add connection error handling
      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("connect", () => {
        // Socket connected successfully
      });

      return () => {
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
      refreshUnreadCounts
    }}>
      {children}
    </SocketContext.Provider>
  );
};
