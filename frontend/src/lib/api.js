import axiosInstance from './axios';
// =======================
// Auth related API calls
// =======================
export const authAPI = {
  getCurrentUser: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      console.log("Auth success:", res.data);
      return res.data;
    } catch (error) {
      console.error("Auth error:", error);
      console.error("Auth error status:", error.response?.status);
      console.error("Auth error data:", error.response?.data);
      return { user: null };
    }
  },
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  signup: async (userData) => {
    const response = await axiosInstance.post('/auth/signup', userData);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  verifyEmail: async (email, code) => {
    const response = await axiosInstance.post('/auth/verify-email', { email, code });
    return response.data;
  },

  resendVerificationCode: async (email) => {
    const response = await axiosInstance.post('/auth/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, code, password) => {
    const response = await axiosInstance.post('/auth/reset-password', { email, code, password });
    return response.data;
  }
};

// User related API calls

// Add this to your existing API functions
export const userAPI = {
  getRecommendedUsers: async () => {
    const response = await axiosInstance.get('/user');
    return response.data;
  },

  getFriendUsers: async () => {
    const response = await axiosInstance.get('/user/friend');
    return response.data;
  },

  sendFriendRequest: async (userId) => {
    const response = await axiosInstance.post(`/user/friend-request/${userId}`);
    return response.data;
  },

  cancelFriendRequest: async (requestId) => {
    const response = await axiosInstance.delete(`/user/friend-request/${requestId}`);
    return response.data;
  },

  acceptFriendRequest: async (userId) => {
    const response = await axiosInstance.put(`/user/friend-request/${userId}/accept`);
    return response.data;
  },

  getFriendRequests: async () => {
    const response = await axiosInstance.get('/user/friend-requests');
    return response.data;
  },

  getOutgoingFriendRequests: async () => {
    const response = await axiosInstance.get('/user/outgoing-friend-requests');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/user/${userId}`);
    return response.data.user;
  },

  searchUsers: async (query) => {
    const response = await axiosInstance.get(`/user/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};

// Chat related API calls
export const chatAPI = {
  getUserChats: async () => {
    try {
      const response = await axiosInstance.get('/chat/chats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  },
  
  getUnreadMessagesCount: async () => {
    try {
      const response = await axiosInstance.get('/chat/unread-count');
      return response.data;
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
      return { count: 0 };
    }
  },
  
  markMessagesAsRead: async (chatId) => {
    try {
      const response = await axiosInstance.post(`/chat/mark-read/${chatId}`);
      return response.data;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  },
  
  getStreamToken: async () => {
    const response = await axiosInstance.get('/chat/token');
    return response.data;
  },

  createOrGetChat: async (userId) => {
    const response = await axiosInstance.post('/chat/simple-chat', { userId });
    return response.data;
  },

  getChatMessages: async (chatId) => {
    const response = await axiosInstance.get(`/chat/messages/${chatId}`);
    return response.data;
  },

  sendMessage: async (chatId, content) => {
    const response = await axiosInstance.post(`/chat/messages/${chatId}`, { content });
    return response.data;
  },

  uploadImage: async (formData) => {
    const response = await axiosInstance.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
}
