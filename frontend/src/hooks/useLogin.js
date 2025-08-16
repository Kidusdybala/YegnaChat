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
      console.log('✅ Login successful, data:', data);
      toast.success('Logged in successfully!');
      
      // Longer delay for iPhone Safari cookie handling
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force invalidate and refetch auth user
      console.log('🔄 Invalidating auth queries...');
      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
      
      // Force refetch to ensure we get the user data
      console.log('🔄 Refetching auth user...');
      await queryClient.refetchQueries({ queryKey: ['authUser'] });
      
      // Even longer delay before navigation for iPhone Safari
      setTimeout(() => {
        console.log('🚀 Navigating to home...');
        navigate('/', { replace: true });
      }, 1500);
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