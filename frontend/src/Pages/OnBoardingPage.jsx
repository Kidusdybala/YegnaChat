import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';

const OnBoardingPage = () => {
  const navigate = useNavigate();
  const { authUser, refetchUser } = useAuthUser();
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: authUser?.fullName || '',
    bio: authUser?.bio || '',
    profilePic: authUser?.profilePic || ''
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (profileData) => {
      const response = await axiosInstance.post('/auth/onboarding', profileData);
      return response.data;
    },
    onSuccess: () => {
      setLoading(false);
      toast.success('Profile updated successfully!');
      refetchUser();
      navigate('/');
    },
    onError: (error) => {
      setLoading(false);
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload for custom profile picture
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // This base64 string can be stored and will persist after refresh
        const base64String = reader.result;
        setProfile(prev => ({
          ...prev,
          profilePic: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile picture
  const removeProfilePicture = () => {
    setProfile(prev => ({
      ...prev,
      profilePic: ''
    }));
    toast.success('Profile picture removed');
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate inputs
    if (!profile.fullName.trim()) {
      toast.error('Name is required');
      setLoading(false);
      return;
    }
    
    if (!profile.bio.trim()) {
      toast.error('Bio is required');
      setLoading(false);
      return;
    }
    
    updateProfile.mutate(profile);
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-center mb-4">
            <img src="/Logo.png" alt="YegnaChat Logo" className="w-12 h-12" />
            <h2 className="card-title text-2xl ml-2">Complete Your Profile</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Profile Picture Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Profile Picture</label>
              
              <div className="flex justify-center mb-4">
                {profile.profilePic ? (
                  <div className="relative">
                    <div className="avatar">
                      <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={profile.profilePic} alt="Selected profile" />
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="btn btn-circle btn-xs absolute top-0 right-0 bg-error text-white border-none"
                      onClick={removeProfilePicture}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-24">
                      <span className="text-3xl">{profile.fullName.charAt(0).toUpperCase() || '?'}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Upload profile picture</span>
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="file-input file-input-bordered w-full" 
                  onChange={handleFileUpload}
                />
                <label className="label">
                  <span className="label-text-alt">You can upload, change, or remove your profile picture</span>
                </label>
              </div>
            </div>
            
            {/* Full Name */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input 
                type="text" 
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                placeholder="Enter your full name" 
                className="input input-bordered" 
                required 
              />
            </div>
            
            {/* Bio */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea 
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself" 
                className="textarea textarea-bordered h-24" 
                required
              ></textarea>
            </div> 
            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading || updateProfile.isPending}
              >
                {loading || updateProfile.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnBoardingPage;