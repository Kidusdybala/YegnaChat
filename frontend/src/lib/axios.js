import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true,
})

// Add request interceptor to include Authorization header for Chrome iOS
axiosInstance.interceptors.request.use((config) => {
  // Check if we're on Chrome iOS and have a token in localStorage
  const userAgent = navigator.userAgent;
  const isChromeIOS = userAgent.includes('CriOS');
  
  if (isChromeIOS) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🤖 Chrome iOS - Adding Authorization header');
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;