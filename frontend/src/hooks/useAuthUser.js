import useAuth from './useAuth';
import useLogin from './useLogin';
import useSignup from './useSignup';
import useLogout from './useLogout';

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
  
  const {
    logout,
    isLoggingOut
  } = useLogout();
  
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
    signupError,
    
    // Logout functionality
    logout,
    isLoggingOut
  };
};

export default useAuthUser;
