import React, { useState, useEffect } from 'react';
import { userAPI } from '../lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  UserIcon, 
  UserPlusIcon, 
  UsersIcon, 
  CheckIcon, 
  XIcon, 
  MessageCircle,
  Settings,
  Users,
  UserCheck,
  UserX,
  MoreHorizontal,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../lib/api';
import { Link } from 'react-router-dom';
import { getProfilePictureUrl, getUserInitials } from '../utils/imageUtils';

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [showSuggestedDropdown, setShowSuggestedDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

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

  // Decline friend request
  const handleDeclineRequest = async (requestId) => {
    try {
      await userAPI.declineFriendRequest(requestId);
      toast.success('Friend request declined');
      refetchRequests();
    } catch (error) {
      toast.error('Failed to decline friend request');
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

  // Search users with friends appearing first
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await userAPI.searchUsers(query);
      
      // Sort results: friends first, then non-friends
      const friendIds = friends?.map(f => f._id) || [];
      const sortedResults = results.users?.sort((a, b) => {
        const aIsFriend = friendIds.includes(a._id);
        const bIsFriend = friendIds.includes(b._id);
        
        if (aIsFriend && !bIsFriend) return -1;
        if (!aIsFriend && bIsFriend) return 1;
        return 0;
      });
      
      setSearchResults({ users: sortedResults || [] });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ users: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, friends]);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-base-content">Friends</h1>
            
            {/* Suggested Friends Dropdown Button */}
            <div className="relative">
              <button 
                className="btn btn-ghost btn-circle"
                onClick={() => setShowSuggestedDropdown(!showSuggestedDropdown)}
              >
                <UserPlusIcon className="w-5 h-5" />
              </button>
              
              {/* Suggested Friends Dropdown */}
              {showSuggestedDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-3">Friend Suggestions</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {suggestedFriends?.slice(0, 5).map((user) => {
                        const requestSent = hasSentRequestTo(user._id);
                        return (
                          <div key={user._id} className="flex items-center space-x-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full">
                                {getProfilePictureUrl(user) ? (
                                  <img src={getProfilePictureUrl(user)} alt={user.fullName} className="rounded-full object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-semibold">
                                    {getUserInitials(user)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{user.fullName}</p>
                            </div>
                            <button 
                              className={`btn btn-xs ${requestSent ? 'btn-outline' : 'btn-primary'}`}
                              onClick={() => requestSent ? setShowCancelConfirm(user._id) : handleSendRequest(user._id)}
                            >
                              {requestSent ? 'Sent' : 'Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button 
                      className="btn btn-sm btn-outline w-full mt-3"
                      onClick={() => {
                        setActiveTab('suggested');
                        setShowSuggestedDropdown(false);
                      }}
                    >
                      See All Suggestions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-base-content opacity-50" />
            </div>
            <input
              type="text"
              placeholder="Search friends and people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10 pr-4"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="loading loading-spinner loading-sm"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-4">
              <div className="space-y-2">
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                    activeTab === 'requests' ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content'
                  }`}
                  onClick={() => setActiveTab('requests')}
                >
                  <UserPlusIcon className="w-5 h-5" />
                  <span className="font-medium">Friend Requests</span>
                  {friendRequests?.incomingReqs?.length > 0 && (
                    <div className="badge badge-error text-white text-xs ml-auto">
                      {friendRequests.incomingReqs.length}
                    </div>
                  )}
                </button>
                
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                    activeTab === 'friends' ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content'
                  }`}
                  onClick={() => setActiveTab('friends')}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">All Friends</span>
                  <span className="text-xs ml-auto opacity-70">{friends?.length || 0}</span>
                </button>
                
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                    activeTab === 'suggested' ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content'
                  }`}
                  onClick={() => setActiveTab('suggested')}
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">Suggestions</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Search Results Section */}
            {searchQuery && searchResults && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-base-content mb-2">
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className="text-base-content opacity-70">
                    {searchResults.users?.length || 0} people found
                  </p>
                </div>
                
                {searchResults.users?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {searchResults.users.map((user) => {
                      const isFriend = friends?.some(f => f._id === user._id);
                      const requestSent = hasSentRequestTo(user._id);
                      
                      return (
                        <div key={user._id} className="bg-base-100 rounded-lg border border-base-300 p-4 hover:shadow-md transition-shadow">
                          <div className="text-center">
                            <div className="avatar mb-3">
                              <div className="w-16 h-16 rounded-full mx-auto">
                                {getProfilePictureUrl(user) ? (
                                  <img 
                                    src={getProfilePictureUrl(user)} 
                                    alt={user.fullName}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content text-xl font-bold">
                                    {getUserInitials(user)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <h3 className="font-medium text-base-content truncate mb-2">
                              {user.fullName}
                              {isFriend && (
                                <span className="badge badge-success badge-sm ml-2">Friend</span>
                              )}
                            </h3>
                            
                            {isFriend ? (
                              <Link 
                                to={`/chat/${user._id}`} 
                                className="btn btn-primary btn-sm w-full"
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Message
                              </Link>
                            ) : requestSent ? (
                              <button 
                                className="btn btn-outline btn-sm w-full"
                                onClick={() => setShowCancelConfirm(user._id)}
                              >
                                Request Sent
                              </button>
                            ) : (
                              <button 
                                className="btn btn-primary btn-sm w-full"
                                onClick={() => handleSendRequest(user._id)}
                              >
                                <UserPlusIcon className="w-4 h-4 mr-1" />
                                Add Friend
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-base-content opacity-20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-base-content mb-2">No results found</h3>
                    <p className="text-base-content opacity-60">Try searching with a different name.</p>
                  </div>
                )}
              </div>
            )}

            {/* Show regular content only when not searching */}
            {!searchQuery && (
              <>
            
            {/* Friend Requests Section */}
            {activeTab === 'requests' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-base-content mb-2">Friend Requests</h2>
                  <p className="text-base-content opacity-70">
                    {friendRequests?.incomingReqs?.length || 0} pending requests
                  </p>
                </div>
                
                {isLoadingRequests ? (
                  <div className="flex justify-center py-12">
                    <div className="loading loading-spinner loading-lg"></div>
                  </div>
                ) : friendRequests?.incomingReqs?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friendRequests.incomingReqs.map((request) => (
                      <div key={request._id} className="bg-base-100 rounded-lg border border-base-300 p-6">
                        <div className="flex items-start space-x-4">
                          <div className="avatar">
                            <div className="w-20 h-20 rounded-full">
                              {getProfilePictureUrl(request.sender) ? (
                                <img 
                                  src={getProfilePictureUrl(request.sender)} 
                                  alt={request.sender.fullName}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-content text-2xl font-bold">
                                  {getUserInitials(request.sender)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-base-content truncate">
                              {request.sender.fullName}
                            </h3>
                            <p className="text-base-content opacity-60 text-sm mb-4">
                              Sent you a friend request
                            </p>
                            <div className="flex space-x-2">
                              <button 
                                className="btn btn-primary btn-sm flex-1"
                                onClick={() => handleAcceptRequest(request._id)}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Accept
                              </button>
                              <button 
                                className="btn btn-outline btn-sm flex-1"
                                onClick={() => handleDeclineRequest(request._id)}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserPlusIcon className="w-16 h-16 text-base-content opacity-20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-base-content mb-2">No friend requests</h3>
                    <p className="text-base-content opacity-60">When people send you friend requests, they'll appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* Friends List Section */}
            {activeTab === 'friends' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-base-content mb-2">All Friends</h2>
                  <p className="text-base-content opacity-70">
                    {friends?.length || 0} friends
                  </p>
                </div>
                
                {isLoadingFriends ? (
                  <div className="flex justify-center py-12">
                    <div className="loading loading-spinner loading-lg"></div>
                  </div>
                ) : friends?.length > 0 ? (
                  <div>
                    {/* Friends Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                      {friends.map((friend) => (
                        <div key={friend._id} className="bg-base-100 rounded-lg border border-base-300 p-4 hover:shadow-md transition-shadow">
                          <div className="text-center">
                            <div className="avatar mb-3">
                              <div className="w-16 h-16 rounded-full mx-auto">
                                {getProfilePictureUrl(friend) ? (
                                  <img 
                                    src={getProfilePictureUrl(friend)} 
                                    alt={friend.fullName}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content text-xl font-bold">
                                    {getUserInitials(friend)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <h3 className="font-medium text-base-content truncate mb-2">
                              {friend.fullName}
                            </h3>
                            <Link 
                              to={`/chat/${friend._id}`} 
                              className="btn btn-primary btn-sm w-full"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Message
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Suggested Friends for You Section */}
                    {suggestedFriends?.length > 0 && (
                      <div>
                        <div className="border-t border-base-300 pt-8">
                          <h3 className="text-lg font-semibold text-base-content mb-4">People You May Know</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {suggestedFriends.slice(0, showAllSuggestions ? suggestedFriends.length : 10).map((user) => {
                              const requestSent = hasSentRequestTo(user._id);
                              const requestId = getRequestIdForUser(user._id);
                              
                              return (
                                <div key={user._id} className="bg-base-100 rounded-lg border border-base-300 p-4 hover:shadow-md transition-shadow">
                                  <div className="text-center">
                                    <div className="avatar mb-3">
                                      <div className="w-16 h-16 rounded-full mx-auto">
                                        {getProfilePictureUrl(user) ? (
                                          <img 
                                            src={getProfilePictureUrl(user)} 
                                            alt={user.fullName}
                                            className="rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content text-xl font-bold">
                                            {getUserInitials(user)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <h3 className="font-medium text-base-content truncate mb-2 text-sm">
                                      {user.fullName}
                                    </h3>
                                    {requestSent ? (
                                      <button 
                                        className="btn btn-outline btn-sm w-full"
                                        onClick={() => setShowCancelConfirm(user._id)}
                                      >
                                        Request Sent
                                      </button>
                                    ) : (
                                      <button 
                                        className="btn btn-primary btn-sm w-full"
                                        onClick={() => handleSendRequest(user._id)}
                                      >
                                        <UserPlusIcon className="w-3 h-3 mr-1" />
                                        Add Friend
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {suggestedFriends.length > 10 && (
                            <div className="text-center mt-6">
                              <button 
                                className="btn btn-outline"
                                onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                              >
                                {showAllSuggestions ? 'Show Less' : `See All ${suggestedFriends.length} Suggestions`}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-base-content opacity-20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-base-content mb-2">No friends yet</h3>
                    <p className="text-base-content opacity-60">Start connecting with people to see them here.</p>
                    <button 
                      className="btn btn-primary mt-4"
                      onClick={() => setActiveTab('suggested')}
                    >
                      Find Friends
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Suggested Friends Section */}
            {activeTab === 'suggested' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-base-content mb-2">People You May Know</h2>
                  <p className="text-base-content opacity-70">
                    Suggestions based on mutual connections and interests
                  </p>
                </div>
                
                {isLoadingSuggestions || isLoadingOutgoing ? (
                  <div className="flex justify-center py-12">
                    <div className="loading loading-spinner loading-lg"></div>
                  </div>
                ) : suggestedFriends?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {suggestedFriends.map((user) => {
                      const requestSent = hasSentRequestTo(user._id);
                      const requestId = getRequestIdForUser(user._id);
                      const isShowingConfirm = showCancelConfirm === user._id;
                      
                      return (
                        <div key={user._id} className="bg-base-100 rounded-lg border border-base-300 p-4 hover:shadow-md transition-shadow">
                          <div className="text-center">
                            <div className="avatar mb-3">
                              <div className="w-16 h-16 rounded-full mx-auto">
                                {getProfilePictureUrl(user) ? (
                                  <img 
                                    src={getProfilePictureUrl(user)} 
                                    alt={user.fullName}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content text-xl font-bold">
                                    {getUserInitials(user)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <h3 className="font-medium text-base-content truncate mb-3">
                              {user.fullName}
                            </h3>
                            
                            {isShowingConfirm ? (
                              <div className="space-y-2">
                                <p className="text-xs text-base-content opacity-70 mb-2">Cancel request?</p>
                                <div className="flex space-x-2">
                                  <button 
                                    className="btn btn-error btn-xs flex-1"
                                    onClick={() => handleCancelRequest(requestId)}
                                  >
                                    Yes
                                  </button>
                                  <button 
                                    className="btn btn-ghost btn-xs flex-1"
                                    onClick={() => setShowCancelConfirm(null)}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ) : requestSent ? (
                              <button 
                                className="btn btn-outline btn-sm w-full"
                                onClick={() => setShowCancelConfirm(user._id)}
                              >
                                Request Sent
                              </button>
                            ) : (
                              <button 
                                className="btn btn-primary btn-sm w-full"
                                onClick={() => handleSendRequest(user._id)}
                              >
                                <UserPlusIcon className="w-4 h-4 mr-1" />
                                Add Friend
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserIcon className="w-16 h-16 text-base-content opacity-20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-base-content mb-2">No suggestions available</h3>
                    <p className="text-base-content opacity-60">Check back later for new friend suggestions.</p>
                  </div>
                )}
              </div>
            )}

              </>
            )}

          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showSuggestedDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowSuggestedDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default FriendsPage;