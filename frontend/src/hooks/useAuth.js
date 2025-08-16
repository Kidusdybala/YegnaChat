// Core authentication hook for user data
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../lib/api';

export const useAuth = () => {
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: authAPI.getCurrentUser,
    retry: 1,
    staleTime: 0, // Always refetch
    cacheTime: 0  // Don't cache
  });
  
  const authUser = data?.user;
  
  // Debug logging
  console.log("🔍 Auth Query State:", {
    data,
    authUser,
    isLoading,
    isError
  });
  
  return {
    authUser,
    isLoading,
    isError,
    refetchUser: refetch
  };
};

export default useAuth;