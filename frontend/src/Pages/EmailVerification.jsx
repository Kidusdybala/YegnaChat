import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Get email from URL params or localStorage
  useEffect(() => {
    const emailFromParams = searchParams.get('email');
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail');
    
    if (emailFromParams) {
      setEmail(emailFromParams);
      localStorage.setItem('pendingVerificationEmail', emailFromParams);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // No email found, redirect to signup
      navigate('/signup');
    }
  }, [searchParams, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && !isVerified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isVerified]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async ({ email, code }) => {
      const response = await axiosInstance.post('/auth/verify-email', { email, code });
      return response.data;
    },
    onSuccess: () => {
      setIsVerified(true);
      toast.success('Email verified successfully!');
      localStorage.removeItem('pendingVerificationEmail');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Verification failed');
    }
  });

  // Resend code mutation
  const resendCodeMutation = useMutation({
    mutationFn: async (email) => {
      const response = await axiosInstance.post('/auth/resend-verification', { email });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Verification code sent!');
      setTimeLeft(300); // Reset timer
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to resend code');
    }
  });

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }
    if (verificationCode.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }
    verifyEmailMutation.mutate({ email, code: verificationCode });
  };

  const handleResendCode = () => {
    if (timeLeft > 0) {
      toast.error(`Please wait ${formatTime(timeLeft)} before requesting a new code`);
      return;
    }
    resendCodeMutation.mutate(email);
  };

  if (isVerified) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-base-200"
        data-theme="nord"
      >
        <div className="border border-primary/25 flex flex-col w-full max-w-md mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
          <div className="w-full p-4 sm:p-8 flex flex-col text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="card-title justify-center text-success">Email Verified!</h2>
            <p className="text-base-content/70">
              Your email has been successfully verified. Redirecting to login...
            </p>
            <div className="loading loading-spinner loading-md text-primary mt-4"></div>
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
            <h2 className="card-title justify-center">Verify Your Email</h2>
            <p className="text-sm text-base-content/70">
              We've sent a 6-digit verification code to:
            </p>
            <p className="font-medium text-primary">{email}</p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Verification Code</span>
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="input input-bordered text-center text-lg tracking-widest"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                maxLength={6}
                style={{ fontSize: '16px' }} // Prevent iOS zoom
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={verifyEmailMutation.isPending || verificationCode.length !== 6}
            >
              {verifyEmailMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="divider">Need a new code?</div>
          
          <div className="text-center space-y-2">
            {timeLeft > 0 ? (
              <p className="text-sm text-base-content/70">
                Resend code in: <span className="font-mono text-primary">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button
                onClick={handleResendCode}
                className="btn btn-ghost btn-sm"
                disabled={resendCodeMutation.isPending}
              >
                {resendCodeMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend Code
                  </>
                )}
              </button>
            )}
          </div>

          {/* Back to Signup */}
          <div className="text-center mt-4">
            <button
              onClick={() => {
                localStorage.removeItem('pendingVerificationEmail');
                navigate('/signup');
              }}
              className="btn btn-ghost btn-sm"
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;