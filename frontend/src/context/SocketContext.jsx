import { createContext, useState, useEffect, useContext } from "react";
import useAuthUser from "../hooks/useAuthUser";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthUser();

  useEffect(() => {
    if (authUser) {
      const newSocket = io("http://localhost:5001", {
        query: { userId: authUser._id },
      });

      setSocket(newSocket);

      newSocket.emit("addUser", authUser._id);

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      // Add connection error handling
      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected successfully");
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
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
