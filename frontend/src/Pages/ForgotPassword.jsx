import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Send reset email mutation
  const sendResetEmailMutation = useMutation({
    mutationFn: async (email) => {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response.data;
    },
    onSuccess: () => {
      setIsEmailSent(true);
      toast.success('Password reset email sent!');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to send reset email');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    sendResetEmailMutation.mutate(email);
  };

  if (isEmailSent) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-base-200"
        data-theme="nord"
      >
        <div className="border border-primary/25 flex flex-col w-full max-w-md mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
          <div className="w-full p-4 sm:p-8 flex flex-col text-center">
            <Mail className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="card-title justify-center text-success">Code Sent!</h2>
            <p className="text-base-content/70 mb-4">
              We've sent a 6-digit verification code to:
            </p>
            <p className="font-medium text-primary mb-6">{email}</p>
            <p className="text-sm text-base-content/60 mb-6">
              Check your email for the verification code and use it to reset your password. 
              The code will expire in 10 minutes.
            </p>
            
            <div className="space-y-3">
              <Link 
                to={`/reset-password?email=${encodeURIComponent(email)}`} 
                className="btn btn-primary w-full"
              >
                Enter Verification Code
              </Link>
              
              <button
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail('');
                }}
                className="btn btn-ghost w-full"
              >
                Send Another Code
              </button>
              
              <Link to="/login" className="btn btn-ghost w-full">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-base-200"
      data-theme="nord"
    >
      <div className="border border-primary/25 flex flex-col w-full max-w-md mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        <div className="w-full p-4 sm:p-8 flex flex-col">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="/Logo.png" alt="YegnaChat Logo" className="w-9 h-9" />
              <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                YegnaChat
              </span>
            </div>
            <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="card-title justify-center">Forgot Password?</h2>
            <p className="text-sm text-base-content/70">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontSize: '16px' }} // Prevent iOS zoom
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={sendResetEmailMutation.isPending}
            >
              {sendResetEmailMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="divider">Remember your password?</div>
          
          <Link to="/login" className="btn btn-ghost w-full">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;