import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';

const EditProfile = () => {
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
      const response = await axiosInstance.post('/auth/editprofile', profileData);
      return response.data;
    },
    onSuccess: () => {
      setLoading(false);
      refetchUser();
      navigate('/');
    },
    onError: (error) => {
      setLoading(false);
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
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfile(prev => ({
          ...prev,
          profilePic: base64String
        }));
     
      };
      reader.onerror = () => {
        toast.error('Failed to read the image file');
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
            <img
              src="/Logo.png"
              alt="YegnaChat Logo"
              className="w-12 h-12"
              onError={(e) => {
                console.warn('Logo failed to load');
                e.target.style.display = 'none';
              }}
            />
            <h2 className="card-title text-2xl ml-2">Complete Your Profile</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Profile Picture */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Profile Picture</label>
              <div className="flex justify-center mb-4">
                {profile.profilePic ? (
                  <div className="relative">
                    <div className="avatar">
                      <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img
                          src={profile.profilePic}
                          alt="Selected profile"
                          className="rounded-full object-cover"
                          onError={(e) => {
                            console.warn('Profile picture failed to load');
                            toast.error('Failed to load profile picture');
                            e.target.style.display = 'none';
                            e.target.parentElement.nextSibling.style.display = 'flex';
                          }}
                        />
                      </div>
                      <div
                        className="w-24 h-24 rounded-full bg-neutral-focus text-neutral-content flex items-center justify-center ring ring-primary ring-offset-base-100 ring-offset-2"
                        style={{ display: 'none' }}
                      >
                        <span className="text-2xl font-semibold">
                          {profile.fullName.charAt(0).toUpperCase() || '?'}
                        </span>
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
                  <span className="label-text-alt">
                    You can upload, change, or remove your profile picture (max 5MB)
                  </span>
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

            {/* Save Button */}
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

export default EditProfile;
