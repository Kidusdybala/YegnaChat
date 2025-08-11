import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';

const useProfile = (initialProfile) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile || {
    fullName: '',
    bio: '',
    profilePic: ''
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await axiosInstance.post('/auth/editprofile', profileData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      navigate('/');
    },
    onError: (error) => {
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

  // Handle file upload for profile picture
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
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

  return {
    profile,
    setProfile,
    handleChange,
    handleFileUpload,
    removeProfilePicture,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error
  };
};

export default useProfile;