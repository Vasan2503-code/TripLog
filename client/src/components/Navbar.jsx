import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plane, MapPin, Settings, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'Expense Splitter', icon: <Plane size={20} />, path: '/expense-splitter' },
    { label: 'Photo Map', icon: <MapPin size={20} />, path: '/photo-map' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#fdfaf6] flex flex-col justify-between py-8 border-r border-gray-100/50 shadow-sm z-50">
      <div>
        <div className="px-8 pb-8 flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-sm">
            TRIPLOG
          </h1>
        </div>

        {/* Profile Section */}
        {user ? (
          <div className="flex flex-col items-center justify-center mb-10 px-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shadow-md mb-3 border-2 border-white text-2xl font-bold text-blue-500 uppercase">
              {getInitials(user.name || user.email)}
            </div>
            <h2 className="text-sm font-bold text-gray-800">{user.name || 'User'}</h2>
            <p className="text-xs text-blue-400 truncate w-full text-center">{user.email}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mb-10 px-8">
             <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shadow-md mb-3 border-2 border-white text-gray-400">
               <LogOut size={28} />
             </div>
             <p className="text-sm font-medium text-gray-500">Not Logged In</p>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={`flex items-center space-x-4 px-8 py-3 transition-all duration-200 border-l-4 ${
                  isActive 
                    ? 'border-blue-300 bg-blue-50/50 text-blue-400 font-medium' 
                    : 'border-transparent text-gray-500 hover:bg-gray-50/50 hover:text-gray-900'
                }`}
              >
                <div className={`${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action */}
      <div className="px-8">
        {user ? (
          <button onClick={logout} className="flex items-center space-x-4 w-full py-3 text-gray-500 hover:text-red-500 transition-colors duration-200 group">
            <LogOut size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            <span>Log Out</span>
          </button>
        ) : (
          <button onClick={() => navigate('/login')} className="flex items-center space-x-4 w-full py-3 text-gray-500 hover:text-blue-500 transition-colors duration-200 group">
            <LogIn size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span>Log In</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Navbar;
