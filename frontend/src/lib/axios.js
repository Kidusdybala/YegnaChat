import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // Fixed missing colon after http
  withCredentials: true,
})
export default axiosInstance;