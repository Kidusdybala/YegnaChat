import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../lib/api';

const useFriends = () => {
  // Fetch friends list
  const { 
    data: friends, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['friends'],
    queryFn: userAPI.getFriendUsers
  });

  return {
    friends,
    isLoading,
    refetchFriends: refetch
  };
};

export default useFriends;