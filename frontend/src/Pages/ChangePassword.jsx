import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { ArrowLeft, Eye, EyeOff, Lock, Shield, Check } from 'lucide-react';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  // Simple password validation
  const validatePassword = (password) => {
    return password.length >= 4 && password.length <= 15;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData) => {
      const response = await axiosInstance.post('/auth/change-password', passwordData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      navigate('/settings');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    }
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }

    if (!formData.newPassword.trim()) {
      toast.error('New password is required');
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      toast.error('New password must be between 4 and 15 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    // Submit the form
    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
  };



  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 overflow-y-auto h-full">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/settings')}
            className="btn btn-ghost btn-circle btn-sm sm:btn-md touch-target"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content">Change Password</h1>
            <p className="text-sm sm:text-base text-base-content/70">Update your account password</p>
          </div>
        </div>

        {/* Password Change Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Security Settings</h2>
                <p className="text-sm text-base-content/60">Keep your account secure with a strong password</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Current Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Current Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    className="input input-bordered w-full pr-12 text-base"
                    style={{ fontSize: '16px' }} // Prevent zoom on iOS
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content touch-target"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    className="input input-bordered w-full pr-12 text-base"
                    style={{ fontSize: '16px' }} // Prevent zoom on iOS
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content touch-target"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Length Indicator */}
                {formData.newPassword && (
                  <div className="mt-1">
                    <div className={`text-sm ${
                      validatePassword(formData.newPassword) 
                        ? 'text-success' 
                        : 'text-error'
                    }`}>
                      {formData.newPassword.length}/15 characters
                      {!validatePassword(formData.newPassword) && 
                        ` (must be 4-15 characters)`
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    className="input input-bordered w-full pr-12 text-base"
                    style={{ fontSize: '16px' }} // Prevent zoom on iOS
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content touch-target"
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
                    {formData.newPassword === formData.confirmPassword ? (
                      <div className="flex items-center gap-1 text-success text-sm">
                        <Check className="w-4 h-4" />
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
                    <li>• Keep your password secure and don't share it</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="btn btn-ghost order-2 sm:order-1 touch-target"
                  disabled={changePasswordMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary order-1 sm:order-2 touch-target"
                  disabled={
                    changePasswordMutation.isPending ||
                    !formData.currentPassword ||
                    !formData.newPassword ||
                    !formData.confirmPassword ||
                    formData.newPassword !== formData.confirmPassword ||
                    !validatePassword(formData.newPassword)
                  }
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;