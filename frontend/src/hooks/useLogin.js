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
      
      // Check if we're on Chrome iOS and got a token in response
      const userAgent = navigator.userAgent;
      const isChromeIOS = userAgent.includes('CriOS');
      
      console.log('🔍 Login success - User Agent:', userAgent);
      console.log('🔍 Is Chrome iOS:', isChromeIOS);
      console.log('🔍 Response data:', data);
      
      if (isChromeIOS && data.token) {
        console.log('🤖 Chrome iOS detected - storing token in localStorage');
        localStorage.setItem('auth_token', data.token);
        console.log('✅ Token stored in localStorage');
      } else if (isChromeIOS && !data.token) {
        console.log('❌ Chrome iOS but no token in response');
      }
      
      // Clear all queries and cache
      queryClient.clear();
      
      // Wait for cookie/token to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test if auth is working before redirect
      try {
        const testAuth = await authAPI.getCurrentUser();
        console.log('🔍 Auth test before redirect:', testAuth);
        
        if (testAuth?.user) {
          console.log('✅ Auth working, redirecting...');
          window.location.href = '/';
        } else {
          console.log('❌ Auth not working, staying on login');
          toast.error('Login failed - please try again');
        }
      } catch (error) {
        console.log('❌ Auth test failed:', error);
        toast.error('Login failed - please try again');
      }
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