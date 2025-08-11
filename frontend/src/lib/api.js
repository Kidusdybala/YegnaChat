import axiosInstance from './axios';

// Auth related API calls
export const authAPI = {
  // Get current authenticated user
  getCurrentUser: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    } catch (error) {
      console.error("Auth error:", error);
      return { user: null };
    }
  },
  
  // Login user
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  // Signup user
  signup: async (userData) => {
    const response = await axiosInstance.post('/auth/signup', userData);
    return response.data;
  },
  
  // Logout user
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  }
};

// User related API calls
export const userAPI = {
  // Get recommended users
  getRecommendedUsers: async () => {
    const response = await axiosInstance.get('/user');
    return response.data;
  },
  
  // Get friend users
  getFriendUsers: async () => {
    const response = await axiosInstance.get('/user/friend');
    return response.data;
  },
  
  // Send friend request
  sendFriendRequest: async (userId) => {
    const response = await axiosInstance.post(`/user/friend-request/${userId}`);
    return response.data;
  },
  
  // Cancel friend request
  cancelFriendRequest: async (requestId) => {
    const response = await axiosInstance.delete(`/user/friend-request/${requestId}`);
    return response.data;
  },
  
  // Accept friend request
  acceptFriendRequest: async (userId) => {
    const response = await axiosInstance.put(`/user/friend-request/${userId}/accept`);
    return response.data;
  },
  
  // Get friend requests
  getFriendRequests: async () => {
    const response = await axiosInstance.get('/user/friend-requests');
    return response.data;
  },
  
  // Get outgoing friend requests
  getOutgoingFriendRequests: async () => {
    const response = await axiosInstance.get('/user/outgoing-friend-requests');
    return response.data;
  }
};

// Chat related API calls
export const chatAPI = {
  // Get stream token
  getStreamToken: async () => {
    const response = await axiosInstance.get('/chat/token');
    return response.data;
  },
  
  // Get user chats
  getUserChats: async () => {
    const response = await axiosInstance.get('/chat/user-chats');
    return response.data;
  },
  
  // Get chat messages
  getChatMessages: async (chatId) => {
    const response = await axiosInstance.get(`/chat/messages/${chatId}`);
    return response.data;
  },
  
  // Send message
  sendMessage: async (chatId, message) => {
    const response = await axiosInstance.post(`/chat/messages/${chatId}`, { message });
    return response.data;
  },
  
  // Mark messages as read
  markMessagesAsRead: async (chatId) => {
    const response = await axiosInstance.put(`/chat/messages/${chatId}/read`);
    return response.data;
  },
  
  // Get unread messages count
  getUnreadMessagesCount: async () => {
    const response = await axiosInstance.get('/chat/unread-count');
    return response.data;
  },
  
  // Create or get chat with user
  createOrGetChat: async (userId) => {
    const response = await axiosInstance.post('/chat/create', { userId });
    return response.data;
  },
  
  // Add these to the chatAPI object
  
  // Create or get a Stream chat channel
  createOrGetStreamChat: async (userId) => {
    const response = await axiosInstance.post('/chat/stream-chat', { userId });
    return response.data;
  },
  
  // Upload media for Stream chat
  uploadMedia: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Simple chat API (fallback when Stream is not available)
  createSimpleChat: async (userId) => {
    const response = await axiosInstance.post('/chat/simple-chat', { userId });
    return response.data;
  },

  getUserChats: async () => {
    const response = await axiosInstance.get('/chat/chats');
    return response.data;
  },

  getChatMessages: async (chatId) => {
    const response = await axiosInstance.get(`/chat/messages/${chatId}`);
    return response.data;
  },

  sendChatMessage: async (chatId, content) => {
    const response = await axiosInstance.post(`/chat/messages/${chatId}`, { content });
    return response.data;
  }
};