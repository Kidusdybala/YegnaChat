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
    queryFn: authAPI.getCurrentUser
  });
  
  const authUser = data?.user;
  
  return {
    authUser,
    isLoading,
    isError,
    refetchUser: refetch
  };
};

export default useAuth;