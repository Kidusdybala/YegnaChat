import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../lib/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      toast.success('Logged in successfully!');
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      navigate('/');
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Failed to login');
    }
  });
  
  return {
    login: loginMutation.mutate,
    isLoginPending: loginMutation.isPending,
    loginError: loginMutation.error
  };
};

export default useLogin;