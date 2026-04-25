import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#faf9f8]">
      <Navbar />
      <main className="flex-1 ml-0 md:ml-64 mt-16 md:mt-0 overflow-x-hidden p-4 sm:p-6 md:p-10 bg-[#faf9f8] min-h-screen">
        <Outlet />
      </main>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
          },
        }}
      />
    </div>
  );
};

export default Layout;
