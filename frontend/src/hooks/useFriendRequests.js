import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../lib/api';
import { toast } from 'react-hot-toast';

const useFriendRequests = () => {
  const queryClient = useQueryClient();

  // Fetch friend requests
  const { 
    data: friendRequests, 
    isLoading: isLoadingRequests, 
    refetch: refetchRequests 
  } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: userAPI.getFriendRequests
  });

  // Fetch outgoing friend requests
  const { 
    data: outgoingRequests, 
    isLoading: isLoadingOutgoing, 
    refetch: refetchOutgoing 
  } = useQuery({
    queryKey: ['outgoingRequests'],
    queryFn: userAPI.getOutgoingFriendRequests
  });

  // Accept friend request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: userAPI.acceptFriendRequest,
    onSuccess: () => {
      toast.success('Friend request accepted!');
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      toast.error('Failed to accept friend request');
      console.error(error);
    }
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: userAPI.sendFriendRequest,
    onSuccess: () => {
      toast.success('Friend request sent!');
      queryClient.invalidateQueries({ queryKey: ['outgoingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['suggestedFriends'] });
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
      queryClient.invalidateQueries({ queryKey: ['outgoingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['suggestedFriends'] });
    },
    onError: (error) => {
      toast.error('Failed to cancel friend request');
      console.error(error);
    }
  });

  // Helper functions
  const hasSentRequestTo = (userId) => {
    if (!outgoingRequests) return false;
    return outgoingRequests.some(request => request.receiver._id === userId);
  };

  const getRequestIdForUser = (userId) => {
    if (!outgoingRequests) return null;
    const request = outgoingRequests.find(req => req.receiver._id === userId);
    return request ? request._id : null;
  };

  return {
    // Data
    friendRequests,
    outgoingRequests,
    incomingRequests: friendRequests?.incomingReqs || [],
    acceptedRequests: friendRequests?.acceptedReqs || [],
    
    // Loading states
    isLoadingRequests,
    isLoadingOutgoing,
    
    // Refetch functions
    refetchRequests,
    refetchOutgoing,
    
    // Mutations
    acceptRequest: acceptRequestMutation.mutate,
    sendRequest: sendRequestMutation.mutate,
    cancelRequest: cancelRequestMutation.mutate,
    
    // Pending states
    isAccepting: acceptRequestMutation.isPending,
    isSending: sendRequestMutation.isPending,
    isCanceling: cancelRequestMutation.isPending,
    
    // Helper functions
    hasSentRequestTo,
    getRequestIdForUser
  };
};

export default useFriendRequests;