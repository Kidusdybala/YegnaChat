import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../lib/api';

const useSuggestedFriends = () => {
  // Fetch suggested friends
  const { 
    data: suggestedFriends, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['suggestedFriends'],
    queryFn: userAPI.getRecommendedUsers
  });

  return {
    suggestedFriends,
    isLoading,
    refetchSuggestions: refetch
  };
};

export default useSuggestedFriends;