import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';

export const SignUpPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formErrors, setFormErrors] = useState({});
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    // Validate full name
    if (signupData.fullName.trim().length < 3) {
      errors.fullName = 'Full name must be at least 3 characters';
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (signupData.password.length < 4 || signupData.password.length > 15) {
      errors.password = 'Password must be between 4 and 15 characters';
    }
    
    // Validate confirm password
    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      // Validate form before submitting
      if (!validateForm()) {
        throw new Error('Please fix the form errors');
      }
      
      const { confirmPassword, ...dataToSubmit } = signupData;
      const response = await axiosInstance.post('/auth/signup', dataToSubmit);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('User created successfully!');
      queryClient.invalidateQueries({ queryKey: ['authUser'] }); // Fixed queryKey name
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    },
    onError: (error) => {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Failed to create account');
    }
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    mutate();
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
          {error && error.response?.data?.message && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join YegnaChat and start chatting with your friends!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className={`input input-bordered w-full ${formErrors.fullName ? 'input-error' : ''}`}
                      value={signupData.fullName}
                      onChange={(e) =>
                        setSignupData({ ...signupData, fullName: e.target.value })
                      }
                      required
                    />
                    {formErrors.fullName && (
                      <p className="text-xs text-error mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className={`input input-bordered w-full ${formErrors.email ? 'input-error' : ''}`}
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
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
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({ ...signupData, password: e.target.value })
                      }
                      required
                    />
                    {formErrors.password ? (
                      <p className="text-xs text-error mt-1">{formErrors.password}</p>
                    ) : (
                      <p className="text-xs opacity-70 mt-1">
                        Password must be between 4 and 15 characters
                      </p>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Confirm Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className={`input input-bordered w-full ${formErrors.confirmPassword ? 'input-error' : ''}`}
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        setSignupData({ ...signupData, confirmPassword: e.target.value })
                      }
                      required
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-xs text-error mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* TERMS CHECKBOX */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{' '}
                        <span className="text-primary hover:underline">terms of service</span> and{' '}
                        <span className="text-primary hover:underline">privacy policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button className="btn btn-primary w-full" type="submit">
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                {/* SIGN IN LINK */}
                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
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

export default SignUpPage;
