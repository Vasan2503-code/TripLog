import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f8]">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create an Account</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all" 
              placeholder="Enter your full name" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all" 
              placeholder="Enter your email" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all" 
              placeholder="Create a password" 
              required
            />
          </div>
          <button type="submit" className="w-full bg-[#90caf9] text-white font-medium py-2 rounded-lg hover:bg-blue-400 transition-colors mt-6 shadow-sm">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <a href="/login" className="text-blue-400 hover:text-blue-500 font-medium">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
