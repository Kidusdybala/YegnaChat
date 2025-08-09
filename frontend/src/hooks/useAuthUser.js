import useAuth from './useAuth';
import useLogin from './useLogin';
import useSignup from './useSignup';

export const useAuthUser = () => {
  const {
    authUser,
    isLoading,
    isError,
    refetchUser
  } = useAuth();
  
  const {
    login,
    isLoginPending,
    loginError
  } = useLogin();
  
  const {
    signup,
    isSignupPending,
    signupError
  } = useSignup();
  
  return {
    // Auth state
    authUser,
    isLoading,
    isError,
    refetchUser,
    
    // Login functionality
    login,
    isLoginPending,
    loginError,
    
    // Signup functionality
    signup,
    isSignupPending,
    signupError
  };
};

export default useAuthUser;
