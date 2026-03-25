import  { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you'd fetch /api/auth/me to get the user object using the token
    if (token) {
      // Decode JWT payload (naive approach for UI purposes without a /me route)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, name: localStorage.getItem('userName') || 'User', email: localStorage.getItem('userEmail') || '' });
      } catch (e) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/verify/login', { email, password });
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', email);
      setUser({ email }); // Will be updated by useEffect
      toast.success(data.message || 'Logged in successfully!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'User Not Exist');
      // console.log(error);
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post('/verify/register', { name, email, password });
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      toast.success(data.message || 'Registered successfully!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
