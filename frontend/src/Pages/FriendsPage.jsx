import React, { useState, useEffect } from 'react';
import { userAPI } from '../lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { UserIcon, UserPlusIcon, UsersIcon, CheckIcon, XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../lib/api';
import { Link } from 'react-router-dom';
import { getProfilePictureUrl } from '../utils/imageUtils';

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);

  // Fetch friend requests
  const { data: friendRequests, isLoading: isLoadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: userAPI.getFriendRequests
  });

  // Fetch outgoing friend requests
  const { data: outgoingRequests, isLoading: isLoadingOutgoing, refetch: refetchOutgoing } = useQuery({
    queryKey: ['outgoingRequests'],
    queryFn: userAPI.getOutgoingFriendRequests
  });
  // Fetch friends list
  const { data: friends, isLoading: isLoadingFriends, refetch: refetchFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: userAPI.getFriendUsers
  });
  // Fetch suggested friends
  const { data: suggestedFriends, isLoading: isLoadingSuggestions, refetch: refetchSuggestions } = useQuery({
    queryKey: ['suggestedFriends'],
    queryFn: userAPI.getRecommendedUsers
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: userAPI.sendFriendRequest,
    onSuccess: () => {
      toast.success('Friend request sent!');
      refetchOutgoing();
      refetchSuggestions();
    },
    onError: (error) => {
      toast.error('Failed to send friend request');
      console.error(error);
    }
  });

  // Cancel friend request mutation
  const cancelRequestMutation = useMutation({
    mutationFn: userAPI.cancelFriendRequest,
    onSuccess: () => {
      toast.success('Friend request canceled!');
      refetchOutgoing();
      refetchSuggestions();
      setShowCancelConfirm(null);
    },
    onError: (error) => {
      toast.error('Failed to cancel friend request');
      console.error(error);
      setShowCancelConfirm(null);
    }
  });

  // Accept friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      await userAPI.acceptFriendRequest(requestId);
      toast.success('Friend request accepted!');
      refetchRequests();
      refetchFriends();
    } catch (error) {
      toast.error('Failed to accept friend request');
      console.error(error);
    }
  };

  // Send friend request
  const handleSendRequest = (userId) => {
    sendRequestMutation.mutate(userId);
  };

  // Cancel friend request
  const handleCancelRequest = (requestId) => {
    cancelRequestMutation.mutate(requestId);
  };

  // Check if a friend request has been sent to a user
  const hasSentRequestTo = (userId) => {
    if (!outgoingRequests) return false;
    return outgoingRequests.some(request => request.receiver._id === userId);
  };

  // Get the request ID if a request has been sent to this user
  const getRequestIdForUser = (userId) => {
    if (!outgoingRequests) return null;
    const request = outgoingRequests.find(req => req.receiver._id === userId);
    return request ? request._id : null;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Friends</h1>
      
      {/* Tabs */}
      <div className="tabs tabs-boxed mb-4">
        <a 
          className={`tab ${activeTab === 'requests' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <UserPlusIcon className="w-4 h-4 mr-2" />
          Friend Requests
          {friendRequests?.incomingReqs?.length > 0 && (
            <div className="badge badge-sm badge-error text-white ml-2">
              {friendRequests.incomingReqs.length}
            </div>
          )}
        </a>
        <a 
          className={`tab ${activeTab === 'friends' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <UsersIcon className="w-4 h-4 mr-2" />
          My Friends
        </a>
        <a 
          className={`tab ${activeTab === 'suggested' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('suggested')}
        >
          <UserIcon className="w-4 h-4 mr-2" />
          Suggested Friends
        </a>
      </div>

      {/* Friend Requests Tab */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingRequests ? (
            <div className="col-span-full text-center py-10">Loading friend requests...</div>
          ) : friendRequests?.incomingReqs?.length > 0 ? (
            friendRequests.incomingReqs.map((request) => (
              <div key={request._id} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-16 rounded-full">
                        {getProfilePictureUrl(request.sender) && (
                          <img 
                            src={getProfilePictureUrl(request.sender)} 
                            alt={request.sender.fullName}
                            className="rounded-full object-cover"
                            onError={(e) => {
                              console.warn('Profile picture failed to load for:', request.sender.fullName);
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <h2 className="card-title">{request.sender.fullName}</h2>
                      <p className="text-sm opacity-70">Wants to be your friend</p>
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => handleAcceptRequest(request._id)}
                    >
                      <CheckIcon className="w-4 h-4 mr-1" /> Accept
                    </button>
                    <button className="btn btn-sm btn-error">
                      <XIcon className="w-4 h-4 mr-1" /> Decline
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">No friend requests at the moment</div>
          )}
        </div>
      )}

      {/* Friends List Tab */}
      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingFriends ? (
            <div className="col-span-full text-center py-10">Loading friends...</div>
          ) : friends?.length > 0 ? (
            friends.map((friend) => (
              <div key={friend._id} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-16 rounded-full">
                        {getProfilePictureUrl(friend) && (
                          <img 
                            src={getProfilePictureUrl(friend)} 
                            alt={friend.fullName}
                            className="rounded-full object-cover"
                            onError={(e) => {
                              console.warn('Profile picture failed to load for:', friend.fullName);
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <h2 className="card-title">{friend.fullName}</h2>
                      <div className="flex items-center mt-2">
                        <div className="badge badge-success mr-2">Friend</div>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-4">
                  <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
                  Message
                  </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">You don't have any friends yet</div>
          )}
        </div>
      )}

      {/* Suggested Friends Tab */}
      {activeTab === 'suggested' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingSuggestions || isLoadingOutgoing ? (
            <div className="col-span-full text-center py-10">Loading suggestions...</div>
          ) : suggestedFriends?.length > 0 ? (
            suggestedFriends.map((user) => {
              const requestSent = hasSentRequestTo(user._id);
              const requestId = getRequestIdForUser(user._id);
              const isShowingConfirm = showCancelConfirm === user._id;
              
              return (
                <div key={user._id} className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center gap-4">
                      <div className="avatar">
                        <div className="w-16 rounded-full">
                          {getProfilePictureUrl(user) && (
                            <img 
                              src={getProfilePictureUrl(user)} 
                              alt={user.fullName}
                              className="rounded-full object-cover"
                              onError={(e) => {
                                console.warn('Profile picture failed to load for:', user.fullName);
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <h2 className="card-title">{user.fullName}</h2>
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      {isShowingConfirm ? (
                        <div className="flex flex-col w-full items-end">
                          <p className="text-sm mb-2">Cancel friend request?</p>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-sm btn-error"
                              onClick={() => handleCancelRequest(requestId)}
                            >
                              Yes, Cancel
                            </button>
                            <button 
                              className="btn btn-sm btn-ghost"
                              onClick={() => setShowCancelConfirm(null)}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : requestSent ? (
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => setShowCancelConfirm(user._id)}
                        >
                          Request Sent
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleSendRequest(user._id)}
                        >
                          <UserPlusIcon className="w-4 h-4 mr-1" /> Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-10">No suggested friends at the moment</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;

// Handle message button click
const handleMessageClick = async (friendId) => {
  try {
    // Navigate to the chat page with the friend ID
    navigate(`/chat/${friendId}`);
  } catch (error) {
    toast.error('Failed to open chat');
    console.error(error);
  }
};