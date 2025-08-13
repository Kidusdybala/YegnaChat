import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      
      // Clear local storage/session storage if any
      localStorage.clear();
      sessionStorage.clear();
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Navigate to login page
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.error('Logout error:', error);
      toast.error(error?.response?.data?.message || 'Failed to logout');
    }
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    logout,
    isLoggingOut: logoutMutation.isPending
  };
};

export default useLogout;