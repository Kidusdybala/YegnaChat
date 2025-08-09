import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../lib/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const useSignup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const signupMutation = useMutation({
    mutationFn: authAPI.signup,
    onSuccess: (data) => {
      toast.success('User created successfully!');
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      navigate('/login');
    },
    onError: (error) => {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Failed to create account');
    }
  });
  
  return {
    signup: signupMutation.mutate,
    isSignupPending: signupMutation.isPending,
    signupError: signupMutation.error
  };
};

export default useSignup;