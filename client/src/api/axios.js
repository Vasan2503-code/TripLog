import axiosOriginal from 'axios';

// Configure the backend URL based on the environment
export const BACKEND_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:3000' 
  : 'https://triplog-x00a.onrender.com';

// Configure Axios
const axios = axiosOriginal.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// Request interceptor to attach JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
