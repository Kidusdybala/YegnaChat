import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false
  });
  const [token, setToken] = useState('');
  const [isReset, setIsReset] = useState(false);

  // Get token from URL params
  useEffect(() => {
    const tokenFromParams = searchParams.get('token');
    if (!tokenFromParams) {
      toast.error('Invalid reset link');
      navigate('/login');
      return;
    }
    setToken(tokenFromParams);
  }, [searchParams, navigate]);

  // Validate password
  const validatePassword = (password) => {
    return password.length >= 4 && password.length <= 15;
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, password }) => {
      const response = await axiosInstance.post('/auth/reset-password', { token, password });
      return response.data;
    },
    onSuccess: () => {
      setIsReset(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to reset password');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.password.trim()) {
      toast.error('Password is required');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must be between 4 and 15 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    resetPasswordMutation.mutate({ token, password: formData.password });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isReset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="card-title justify-center text-success">Password Reset!</h2>
            <p className="text-base-content/70">
              Your password has been successfully reset. Redirecting to login...
            </p>
            <div className="loading loading-spinner loading-md text-primary mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="/Logo.png" alt="YegnaChat Logo" className="w-9 h-9" />
              <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                YegnaChat
              </span>
            </div>
            <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="card-title justify-center">Reset Password</h2>
            <p className="text-sm text-base-content/70">
              Enter your new password below
            </p>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.password ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter new password"
                  className="input input-bordered w-full pr-12"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                >
                  {showPasswords.password ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Length Indicator */}
              {formData.password && (
                <div className="mt-1">
                  <div className={`text-sm ${
                    validatePassword(formData.password) 
                      ? 'text-success' 
                      : 'text-error'
                  }`}>
                    {formData.password.length}/15 characters
                    {!validatePassword(formData.password) && 
                      ` (must be 4-15 characters)`
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  className="input input-bordered w-full pr-12"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-1">
                  {formData.password === formData.confirmPassword ? (
                    <div className="flex items-center gap-1 text-success text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Passwords match</span>
                    </div>
                  ) : (
                    <div className="text-error text-sm">
                      Passwords do not match
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="alert alert-info">
              <Lock className="w-5 h-5" />
              <div className="text-sm">
                <div className="font-medium mb-1">Password Requirements:</div>
                <ul className="text-xs space-y-1 opacity-80">
                  <li>• Must be between 4 and 15 characters long</li>
                  <li>• Use a unique password you don't use elsewhere</li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={
                resetPasswordMutation.isPending ||
                !formData.password ||
                !formData.confirmPassword ||
                formData.password !== formData.confirmPassword ||
                !validatePassword(formData.password)
              }
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/login')}
              className="btn btn-ghost btn-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;