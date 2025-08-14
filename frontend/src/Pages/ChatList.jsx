// frontend/src/components/ChatList.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { chatAPI } from '../lib/api';
import { getProfilePictureUrl } from '../utils/imageUtils';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircleIcon } from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthUser();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await chatAPI.getUserChats();
        setChats(response.chats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleChatClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  // Function to format the timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Function to get the other user from participants
  const getOtherUser = (participants, currentUserId) => {
    return participants.find(user => user._id !== currentUserId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageCircleIcon className="w-16 h-16 text-base-content opacity-20 mb-4" />
        <h3 className="font-semibold text-lg">No conversations yet</h3>
        <p className="text-sm text-base-content opacity-60">
          Start chatting with your friends
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 sm:p-4">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Recent Chats</h2>
        <div className="space-y-1 sm:space-y-2">
          {chats.map((chat) => {
            const otherUser = getOtherUser(chat.participants, authUser?._id);
            if (!otherUser) return null;
            
            const isActive = location.pathname === `/chat/${otherUser._id}`;
            
            return (
              <div
                key={chat._id}
                onClick={() => handleChatClick(otherUser._id)}
                className={`flex items-center p-2 sm:p-3 rounded-lg cursor-pointer transition-colors touch-target ${
                  isActive 
                    ? 'bg-primary bg-opacity-20' 
                    : 'hover:bg-base-200 active:bg-base-300'
                }`}
              >
                <div className="avatar flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full">
                    <img
                      src={getProfilePictureUrl(otherUser) || '/default-avatar.png'}
                      alt={otherUser.fullName}
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                </div>
                
                <div className="ml-2 sm:ml-3 flex-1 overflow-hidden min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold truncate text-sm sm:text-base">{otherUser.fullName}</h3>
                    {chat.lastMessage && (
                      <span className="text-xs opacity-60 flex-shrink-0 ml-2">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  {chat.lastMessage ? (
                    <p className="text-xs sm:text-sm opacity-70 truncate">
                      {chat.lastMessage.content.startsWith('/uploads/') 
                        ? '🖼️ Image' 
                        : chat.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm opacity-50 italic">No messages yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
