// Core authentication hook for user data
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../lib/api';

export const useAuth = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
    error
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: authAPI.getCurrentUser,
    retry: 1,
    staleTime: 0, // Always refetch when invalidated
    onError: (error) => {
      console.error("Auth query error:", error);
    }
  });

  const authUser = data?.user;

  // Debug logging
  console.log("Auth state:", { authUser, isLoading, isError, data, error });

  return {
    authUser,
    isLoading,
    isError,
    refetchUser: refetch
  };
};

export default useAuth;