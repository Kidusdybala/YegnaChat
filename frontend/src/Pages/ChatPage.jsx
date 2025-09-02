// frontend/src/Pages/ChatPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useSocketContext } from "../context/SocketContext";
import { chatAPI, userAPI } from "../lib/api";
import { Send, Phone, Video, Image, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

import VideoCall from "../components/VideoCall";
import ChatList from "../components/ChatList";
import { getProfilePictureUrl, getUserInitials } from "../utils/imageUtils";

const ChatPage = () => {
  const { chatId: targetUserId } = useParams();
  const { authUser, refetchUser } = useAuthUser();
  const { socket } = useSocketContext();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  
  // Create ref for auto-scrolling
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
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

  // Auto-refresh messages every 30 seconds (backup for socket failures)
  useEffect(() => {
    if (!chatId) return;
    
    const refreshMessages = async () => {
      try {
        const messagesResponse = await chatAPI.getChatMessages(chatId);
        setMessages(messagesResponse.messages || []);
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    };
    
    const interval = setInterval(refreshMessages, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [chatId]);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
        <div className="lg:col-span-1 border-r border-base-300 h-full">
          <ChatList />
        </div>
        <div className="hidden lg:flex lg:col-span-2 items-center justify-center bg-base-100">
          <div className="text-center p-6">
            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-base-content opacity-20 mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-base-content">Select a conversation</h2>
            <p className="text-sm sm:text-base text-base-content opacity-60 mt-2">
              Choose a chat from the sidebar to start messaging
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
        <div className="hidden lg:block lg:col-span-1 border-r border-base-300 h-full">
          <ChatList />
        </div>
        <div className="col-span-1 lg:col-span-2 flex items-center justify-center bg-base-100">
          <div className="text-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-base-content">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-full bg-base-100">
      <div className="hidden lg:block lg:col-span-1 border-r border-base-300 h-full">
        <ChatList />
      </div>

      <div className="col-span-1 lg:col-span-2 flex flex-col h-full relative">
        {/* Show VideoCall component when showVideoCall is true */}
        {showVideoCall && targetUser && (
          <VideoCall targetUser={targetUser} onEndCall={handleEndCall} />
        )}

        {/* Chat Header */}
        <div className="bg-gradient-to-r from-primary to-primary-focus px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between text-primary-content shadow-lg border-b border-primary-focus/20">
          {/* Mobile back button */}
          <button
            className="lg:hidden btn btn-ghost btn-circle btn-sm text-primary-content mr-2 hover:bg-primary-focus/50 transition-colors"
            onClick={() => window.history.back()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Center section wrapper */}
          <div className="flex-1 flex justify-center lg:justify-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="avatar">
                <div className="w-9 sm:w-11 lg:w-13 rounded-full ring-2 ring-white/20">
                  {getProfilePictureUrl(targetUser) ? (
                    <img
                      src={getProfilePictureUrl(targetUser)}
                      alt={targetUser?.fullName}
                      className="w-9 h-9 sm:w-11 sm:h-11 lg:w-13 lg:h-13 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-13 lg:h-13 rounded-full bg-primary-content/20 flex items-center justify-center text-primary-content font-semibold text-sm sm:text-base lg:text-lg" style={{display: getProfilePictureUrl(targetUser) ? 'none' : 'flex'}}>
                    {getUserInitials(targetUser)}
                  </div>
                </div>
              </div>
              <div className="text-center min-w-0">
                <h2 className="font-semibold text-primary-content text-sm sm:text-base lg:text-lg truncate">{targetUser?.fullName}</h2>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs sm:text-sm text-primary-content opacity-90">Online</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-1 sm:space-x-2">
            <button
              className="p-2 sm:p-2.5 hover:bg-primary-focus/50 rounded-full transition-all duration-200 text-primary-content hover:scale-105 active:scale-95"
              onClick={() => navigate(`/call?userId=${targetUserId}`)}
              title="Start call"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              className="p-2 sm:p-2.5 hover:bg-primary-focus/50 rounded-full transition-all duration-200 text-primary-content hover:scale-105 active:scale-95"
              onClick={handleVideoCall}
              title="Start video call"
            >
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
    
        {/* Messages - Enhanced mobile-friendly layout */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 bg-gradient-to-b from-base-200 to-base-100">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-base-content opacity-20 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-base-content mb-2">No messages yet</h3>
              <p className="text-sm text-base-content opacity-60">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMyMessage = message.sender._id === authUser._id;
              return (
                <div
                  key={message._id}
                  className={`flex mb-4 sm:mb-5 ${isMyMessage ? "justify-start" : "justify-end"}`}
                >
                  <div className={`flex items-end space-x-2 sm:space-x-3 max-w-[88%] sm:max-w-[80%] ${isMyMessage ? "flex-row" : "flex-row-reverse space-x-reverse"}`}>
                    {/* Avatar for received messages only */}
                    {!isMyMessage && (
                      <div className="flex-shrink-0 mb-1">
                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-base-300">
                          {getProfilePictureUrl(targetUser) ? (
                            <img
                              src={getProfilePictureUrl(targetUser)}
                              alt={targetUser?.fullName}
                              className="w-7 h-7 sm:w-9 sm:h-9 object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-7 h-7 sm:w-9 sm:h-9 bg-primary flex items-center justify-center text-primary-content font-medium text-xs sm:text-sm" style={{display: getProfilePictureUrl(targetUser) ? 'none' : 'flex'}}>
                            {getUserInitials(targetUser)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col min-w-0">
                      {/* Message bubble */}
                      <div
                        className={`relative px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-lg max-w-full transition-all duration-200 hover:shadow-xl ${
                          isMyMessage
                            ? "bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-bl-md"
                            : "bg-base-100 text-base-content border border-base-300 rounded-br-md"
                        }`}
                      >
                        {/* Message content */}
                        {message.content.startsWith('/uploads/') ? (
                          <div className="rounded-xl overflow-hidden border border-base-300">
                            <img
                              src={`http://localhost:5001${message.content}`}
                              alt="Shared image"
                              className="max-w-full h-auto rounded-xl max-w-[300px] sm:max-w-sm"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                            {message.content}
                          </p>
                        )}

                        {/* Time and status */}
                        <div className={`flex items-center justify-end mt-2 space-x-1.5 ${isMyMessage ? "text-primary-content opacity-80" : "text-base-content opacity-60"}`}>
                          <span className="text-xs font-medium">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isMyMessage && (
                            <svg className="w-3.5 h-3.5 opacity-90" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Scroll to bottom spacer */}
          <div className="h-6"></div>
          <div ref={messagesEndRef} />
        </div>
    
        {/* Message Input - Enhanced mobile-friendly design */}
        <div className="border-t border-base-300 bg-gradient-to-t from-base-100 to-base-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 safe-area-inset-bottom flex-shrink-0 shadow-lg">
          <form onSubmit={sendMessage} className="flex items-end space-x-3 sm:space-x-4">
            {/* File Upload Button */}
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
              className={`flex-shrink-0 p-2.5 sm:p-3 text-base-content opacity-60 hover:text-primary cursor-pointer transition-all duration-200 rounded-full hover:bg-base-200 active:bg-base-300 touch-target min-w-[48px] min-h-[48px] flex items-center justify-center hover:scale-105 active:scale-95 ${isUploading ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <Image className="w-5 h-5 sm:w-6 sm:h-6" />
            </label>

            {/* Message Input Container */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-base-200 border border-base-300 rounded-3xl text-base text-base-content placeholder-base-content placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-base-100 transition-all duration-200 resize-none max-h-24 sm:max-h-32 leading-6 touch-target shadow-sm"
                style={{ fontSize: '16px' }} // Prevent zoom on iOS
                disabled={isUploading}
              />
              {/* Typing indicator */}
              {newMessage.trim() && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!newMessage.trim() || isUploading}
              className={`flex-shrink-0 p-3 sm:p-4 rounded-full transition-all duration-300 touch-target min-w-[48px] min-h-[48px] flex items-center justify-center shadow-lg ${
                newMessage.trim() && !isUploading
                  ? 'bg-gradient-to-r from-primary to-primary-focus text-primary-content hover:from-primary-focus hover:to-primary hover:scale-105 active:scale-95 hover:shadow-xl'
                  : 'bg-base-300 text-base-content opacity-50 scale-95 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
