import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { chatAPI } from '../lib/api';
import { getProfilePictureUrl, getUserInitials } from '../utils/imageUtils';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircleIcon, RefreshCw } from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser';
import toast from 'react-hot-toast';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthUser();

  const fetchChats = async () => {
    try {
      setLoading(true);
      
      // Make sure we have an authenticated user before fetching chats
      if (!authUser || !authUser._id) {
        setLoading(false);
        return;
      }
      
      const response = await chatAPI.getUserChats();
      
      if (response && response.chats) {
        setChats(response.chats);
      } else {
        setChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };
  


  useEffect(() => {
    if (authUser) {
      fetchChats();
    }
  }, [authUser]);

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

  if (!chats || chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageCircleIcon className="w-16 h-16 text-base-content opacity-20 mb-4" />
        <h3 className="font-semibold text-lg">No conversations yet</h3>
        <p className="text-sm text-base-content opacity-60 mb-4">
          Start chatting with your friends
        </p>
        <Link to="/friends" className="btn btn-sm btn-primary">
          Find Friends to Chat With
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Chats</h2>
          <div className="flex gap-2">
            <button 
              onClick={fetchChats} 
              className="btn btn-sm btn-ghost btn-circle"
              disabled={loading}
              title="Refresh chats"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {chats.map((chat) => {
            const otherUser = getOtherUser(chat.participants, authUser?._id);
            if (!otherUser) return null;
            
            const isActive = location.pathname === `/chat/${otherUser._id}`;
            
            return (
              <div
                key={chat._id}
                onClick={() => handleChatClick(otherUser._id)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-primary bg-opacity-20' 
                    : 'hover:bg-base-200'
                }`}
              >
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    {otherUser.profilePic ? (
                      <img
                        src={getProfilePictureUrl(otherUser) || '/default-avatar.png'}
                        alt={otherUser.fullName}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                        {getUserInitials(otherUser)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate">{otherUser.fullName}</h3>
                    {chat.lastMessage && chat.lastMessage.createdAt && (
                      <span className="text-xs opacity-60">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  {chat.lastMessage && typeof chat.lastMessage.content === 'string' ? (
                    <p className="text-sm opacity-70 truncate">
                      {chat.lastMessage.content.startsWith('/uploads/') 
                        ? '🖼️ Image' 
                        : chat.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm opacity-50 italic">No messages yet</p>
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