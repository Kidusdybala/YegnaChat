import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../lib/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (data) => {
      toast.success('Logged in successfully!');
      
      // Add a small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Invalidate and refetch auth user
      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
      
      // Add another small delay before navigation
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 200);
    },
    onError: (error) => {
      console.error('Login error:', error);
      const errorData = error.response?.data;
      
      // Handle email not verified error
      if (errorData?.emailNotVerified) {
        toast.error('Please verify your email before logging in');
        // Extract email from the login attempt if available
        const email = error.config?.data ? JSON.parse(error.config.data).email : '';
        if (email) {
          localStorage.setItem('pendingVerificationEmail', email);
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          navigate('/verify-email');
        }
        return;
      }
      
      toast.error(errorData?.message || 'Failed to login');
    }
  });
  
  return {
    login: loginMutation.mutate,
    isLoginPending: loginMutation.isPending,
    loginError: loginMutation.error
  };
};

export default useLogin;