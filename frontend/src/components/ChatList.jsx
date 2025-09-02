import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '../lib/api';
import { getProfilePictureUrl, getUserInitials } from '../utils/imageUtils';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircleIcon, RefreshCw, Users } from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser';
import toast from 'react-hot-toast';

const ChatList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthUser();

  // Auto-refresh chats every 5 seconds when user is active
  const { 
    data: chatsData, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['chats', authUser?._id],
    queryFn: async () => {
      if (!authUser?._id) return { chats: [] };
      const response = await chatAPI.getUserChats();
      return response || { chats: [] };
    },
    enabled: !!authUser?._id,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    refetchIntervalInBackground: false, // Only when tab is active
    staleTime: 3000, // Consider data fresh for 3 seconds
    retry: 2,
    onError: (error) => {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    }
  });

  const chats = chatsData?.chats || [];

  const handleChatClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Function to get the other user from participants
  const getOtherUser = (participants, currentUserId) => {
    return participants.find(user => user._id !== currentUserId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-6 sm:p-8">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-base-content opacity-70 text-sm sm:text-base">Loading conversations...</p>
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center bg-gradient-to-br from-base-100 to-base-200">
        <div className="bg-base-300/30 rounded-full p-4 sm:p-6 mb-6">
          <MessageCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-base-content opacity-30" />
        </div>
        <h3 className="font-bold text-lg sm:text-xl text-base-content mb-2">No conversations yet</h3>
        <p className="text-sm sm:text-base text-base-content opacity-60 mb-6 max-w-xs">
          Start chatting with your friends to see your conversations here
        </p>
        <Link to="/friends" className="btn btn-primary btn-md sm:btn-lg shadow-lg hover:shadow-xl transition-all duration-200">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Find Friends
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-base-100">
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-center mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-base-content">Recent Chats</h2>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="btn btn-sm btn-ghost btn-circle hover:bg-base-200 transition-colors"
              disabled={isLoading}
              title="Refresh chats"
            >
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isLoading ? 'animate-spin text-primary' : 'text-base-content'}`} />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {chats.map((chat) => {
            const otherUser = getOtherUser(chat.participants, authUser?._id);
            if (!otherUser) return null;

            const isActive = location.pathname === `/chat/${otherUser._id}`;

            return (
              <div
                key={chat._id}
                onClick={() => handleChatClick(otherUser._id)}
                className={`flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 touch-target ${
                  isActive
                    ? 'bg-primary bg-opacity-15 shadow-md border border-primary/20'
                    : 'hover:bg-base-200 hover:shadow-sm active:bg-base-300'
                }`}
              >
                <div className="avatar">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-base-300/50">
                    {otherUser.profilePic ? (
                      <img
                        src={getProfilePictureUrl(otherUser) || '/default-avatar.png'}
                        alt={otherUser.fullName}
                        className="rounded-full object-cover w-full h-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-primary-focus flex items-center justify-center text-white font-semibold text-base sm:text-lg shadow-md">
                        {getUserInitials(otherUser)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-3 sm:ml-4 flex-1 overflow-hidden min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate text-base sm:text-lg text-base-content">{otherUser.fullName}</h3>
                    {chat.lastMessage && chat.lastMessage.createdAt && (
                      <span className="text-xs opacity-60 ml-2 flex-shrink-0 bg-base-200 px-2 py-1 rounded-full">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  {chat.lastMessage && typeof chat.lastMessage.content === 'string' ? (
                    <p className="text-sm sm:text-base opacity-70 truncate mt-1">
                      {chat.lastMessage.content.startsWith('/uploads/')
                        ? '📷 Photo'
                        : chat.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm opacity-50 italic mt-1">No messages yet</p>
                  )}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatList;