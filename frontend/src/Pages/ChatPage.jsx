// frontend/src/Pages/ChatPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useSocketContext } from "../context/SocketContext";
import { chatAPI, userAPI } from "../lib/api";
import { Send, Phone, Video, Image, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import CallButton from "../components/CallButton";
import VideoCall from "../components/VideoCall";
import ChatList from "../components/ChatList";

const ChatPage = () => {
  const { chatId: targetUserId } = useParams();
  const { authUser, refetchUser } = useAuthUser();
  const { socket } = useSocketContext();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  
  // Handle video call
  const handleVideoCall = () => {
    setShowVideoCall(true);
  };

  // Handle ending the call
  const handleEndCall = () => {
    setShowVideoCall(false);
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await chatAPI.uploadImage(formData);
      
      // Send message with image URL
      const messageResponse = await chatAPI.sendMessage(chatId, response.fileUrl);
      
      // Add to local messages
      setMessages(prev => [...prev, messageResponse.message]);
      
      // Send via Socket.IO for real-time
      socket?.emit('sendMessage', {
        senderId: authUser._id,
        receiverId: targetUserId,
        content: response.fileUrl
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Get target user info
  useEffect(() => {
    const fetchTargetUser = async () => {
      if (!targetUserId) return;
      
      try {
        setLoading(true);
        const user = await userAPI.getUserById(targetUserId);
        setTargetUser(user);
      } catch (error) {
        console.error("Error fetching target user:", error);
        toast.error("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };

    if (targetUserId) {
      fetchTargetUser();
    } else {
      // Reset states when no target user is selected
      setTargetUser(null);
      setMessages([]);
      setChatId(null);
    }
  }, [targetUserId]);

  // Create or get chat
  useEffect(() => {
    const initializeChat = async () => {
      if (!targetUserId || !authUser) return;
      
      try {
        setLoading(true);
        const response = await chatAPI.createOrGetChat(targetUserId);
        setChatId(response.chat._id);
        
        // Load existing messages
        const messagesResponse = await chatAPI.getChatMessages(response.chat._id);
        setMessages(messagesResponse.messages || []);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    if (targetUserId && authUser) {
      initializeChat();
    }
  }, [targetUserId, authUser]);

  // Socket.IO message listeners
  useEffect(() => {
    if (!socket || !targetUserId) return;

    const handleNewMessage = (messageData) => {
      if (messageData.senderId === targetUserId) {
        setMessages(prev => [...prev, {
          _id: Date.now(),
          content: messageData.content,
          sender: { _id: messageData.senderId, fullName: targetUser?.fullName },
          createdAt: messageData.timestamp
        }]);
      }
    };

    socket.on('getMessage', handleNewMessage);

    return () => {
      socket.off('getMessage', handleNewMessage);
    };
  }, [socket, targetUserId, targetUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      // Send via API
      const response = await chatAPI.sendMessage(chatId, newMessage);
      
      // Add to local messages
      setMessages(prev => [...prev, response.message]);
      
      // Send via Socket.IO for real-time
      socket?.emit('sendMessage', {
        senderId: authUser._id,
        receiverId: targetUserId,
        content: newMessage
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // If no chat is selected, show the chat list in a centered layout
  if (!targetUserId) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-4rem)]">
        <div className="md:col-span-1 border-r border-base-300 h-full">
          <ChatList />
        </div>
        <div className="hidden md:flex md:col-span-2 items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto text-base-content opacity-20 mb-4" />
            <h2 className="text-xl font-semibold">Select a conversation</h2>
            <p className="text-base-content opacity-60 mt-2">
              Choose a chat from the sidebar to start messaging
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-4rem)]">
        <div className="md:col-span-1 border-r border-base-300 h-full">
          <ChatList />
        </div>
        <div className="md:col-span-2 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-4rem)]">
      <div className="hidden md:block md:col-span-1 border-r border-base-300 h-full">
        <ChatList />
      </div>
      
      <div className="col-span-1 md:col-span-2 flex flex-col h-full">
        {/* Show VideoCall component when showVideoCall is true */}
        {showVideoCall && targetUser && (
          <VideoCall targetUser={targetUser} onEndCall={handleEndCall} />
        )}
        
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4 flex items-center justify-between text-white shadow-md">
          {/* Center section wrapper */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-3">
              <img
                src={targetUser?.profilePic || "/default-avatar.png"}
                alt={targetUser?.fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="text-center">
                <h2 className="font-semibold">{targetUser?.fullName}</h2>
                <p className="text-sm text-green-300">Online</p>
              </div>
            </div>
          </div>
    
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-blue-600 rounded-full transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button 
              className="p-2 hover:bg-blue-600 rounded-full transition-colors"
              onClick={handleVideoCall}
            >
              <Video className="w-5 h-5" />
            </button>
          </div>
        </div>
    
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === authUser._id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md ${message.sender._id === authUser._id
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.content.startsWith('/uploads/') ? (
                  <img 
                    src={`http://localhost:5001${message.content}`} 
                    alt="Shared image" 
                    className="max-w-full rounded-lg"
                    loading="lazy"
                  />
                ) : (
                  <p>{message.content}</p>
                )}
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
    
        {/* Message Input */}
        <form onSubmit={sendMessage} className="border-t p-3 bg-gray-50">
          <div className="max-w-2xl mx-auto flex items-center space-x-2 w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imageUpload"
              disabled={isUploading}
            />
            <label
              htmlFor="imageUpload"
              className={`p-2 text-gray-500 hover:text-blue-600 cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
            >
              <Image className="h-5 w-5" />
            </label>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isUploading}
              className="bg-blue-800 text-white p-2 rounded-full hover:bg-blue-900 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
