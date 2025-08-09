import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../lib/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      toast.success('Logged out successfully!');
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      navigate('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  });
  
  return {
    logoutMutation: logoutMutation.mutate,
    isLogoutPending: logoutMutation.isPending,
    logoutError: logoutMutation.error
  };
};

export default useLogout;