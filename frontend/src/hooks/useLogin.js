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

      // Store JWT token for header-based auth (in addition to cookies)
      if (data?.token) {
        localStorage.setItem('jwt_token', data.token);
      }

      // Clear and refetch auth user data
      queryClient.removeQueries({ queryKey: ['authUser'] });
      queryClient.invalidateQueries({ queryKey: ['authUser'] });

      // Small delay to ensure cookie is set before navigation
      setTimeout(() => {
        navigate('/');
      }, 100);
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