import axiosOriginal from 'axios';

// Configure Axios
const axios = axiosOriginal.create({
  baseURL: 'http://localhost:3000',
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
