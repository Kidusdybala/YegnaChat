import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../lib/api';
import { getProfilePictureUrl, getUserInitials } from '../utils/imageUtils';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircleIcon, RefreshCw } from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser';
import toast from 'react-hot-toast';

const ChatList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

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
      <div className="flex justify-center items-center h-full p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-3 sm:p-4 text-center">
        <MessageCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-base-content opacity-20 mb-4" />
        <h3 className="font-semibold text-base sm:text-lg">No conversations yet</h3>
        <p className="text-xs sm:text-sm text-base-content opacity-60 mb-4">
          Start chatting with your friends
        </p>
        <Link to="/friends" className="btn btn-xs sm:btn-sm btn-primary">
          Find Friends to Chat With
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Recent Chats</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => refetch()} 
              className="btn btn-sm btn-ghost btn-circle"
              disabled={isLoading}
              title="Refresh chats"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
                className={`flex items-center p-2 sm:p-3 rounded-lg cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-primary bg-opacity-20' 
                    : 'hover:bg-base-200'
                }`}
              >
                <div className="avatar">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full">
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
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                        {getUserInitials(otherUser)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-2 sm:ml-3 flex-1 overflow-hidden min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate text-sm sm:text-base">{otherUser.fullName}</h3>
                    {chat.lastMessage && chat.lastMessage.createdAt && (
                      <span className="text-xs opacity-60 ml-2 flex-shrink-0">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  {chat.lastMessage && typeof chat.lastMessage.content === 'string' ? (
                    <p className="text-xs sm:text-sm opacity-70 truncate">
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