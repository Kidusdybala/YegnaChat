import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser';
import { toast } from 'react-hot-toast';

export const LoginPage = () => {
  const { login, isLoginPending, loginError } = useAuthUser();
  const [formErrors, setFormErrors] = useState({});
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (credentials.password.length < 1) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    login(credentials);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-base-200"
      data-theme="nord"
    >
      <div className="border border-primary/25 flex flex-col w-full max-w-md mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        
        <div className="w-full p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <img src="/Logo.png" alt="YegnaChat Logo" className="w-9 h-9" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              YegnaChat
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {loginError && loginError.response?.data?.message && (
            <div className="alert alert-error mb-4">
              <span>{loginError.response.data.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold">Welcome Back</h2>
                  <p className="text-sm opacity-70">
                    Sign in to continue to YegnaChat
                  </p>
                </div>

                <div className="space-y-3">
                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className={`input input-bordered w-full ${formErrors.email ? 'input-error' : ''}`}
                      value={credentials.email}
                      onChange={(e) =>
                        setCredentials({ ...credentials, email: e.target.value })
                      }
                      required
                    />
                    {formErrors.email && (
                      <p className="text-xs text-error mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className={`input input-bordered w-full ${formErrors.password ? 'input-error' : ''}`}
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({ ...credentials, password: e.target.value })
                      }
                      required
                    />
                    {formErrors.password && (
                      <p className="text-xs text-error mt-1">{formErrors.password}</p>
                    )}
                  </div>

                  {/* REMEMBER ME & FORGOT PASSWORD */}
                  <div className="flex justify-between items-center">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" />
                      <span className="text-xs">Remember me</span>
                    </label>
                    <span className="text-xs text-primary hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button className="btn btn-primary w-full" type="submit">
                  {isLoginPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* SIGN UP LINK */}
                <div className="text-center mt-4">
                  <p className="text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;