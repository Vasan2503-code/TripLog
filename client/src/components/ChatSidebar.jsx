import React, { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { io } from 'socket.io-client';

const ChatSidebar = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey! So excited for this trip ✈️', sender: 'Elena', time: '10:00 AM' },
    { id: 2, text: 'Me too! Did we book the tickets yet?', sender: 'Mark', time: '10:05 AM' }
  ]);
  const [input, setInput] = useState('');

  // Socket simulation setup
  useEffect(() => {
    // const socket = io('http://localhost:5000');
    // return () => socket.disconnect();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { 
      id: Date.now(), 
      text: input, 
      sender: 'Elena', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setInput('');
  };

  return (
    <div className="w-80 bg-white border-l border-gray-100 flex flex-col h-[calc(100vh-80px)] shadow-[-4px_0_24px_rgb(0,0,0,0.02)] fixed right-0 top-0 mt-5 z-20 rounded-l-3xl overflow-hidden mr-5">
      <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-blue-50/30">
        <h3 className="font-bold text-gray-900">Trip Chat</h3>
        <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> Online
        </span>
      </div>
      
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50/10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'Elena' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-gray-400 mb-1 ml-1">{msg.sender} • {msg.time}</span>
            <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
              msg.sender === 'Elena' 
                ? 'bg-[#90caf9] text-white rounded-tr-sm shadow-sm' 
                : 'bg-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-50 bg-white">
        <div className="flex items-center space-x-2 bg-gray-50 rounded-full p-1.5 border border-gray-100 focus-within:border-blue-300 focus-within:bg-white transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent px-3 py-1.5 text-sm outline-none"
          />
          <button 
            onClick={handleSend}
            className="p-2 bg-[#90caf9] text-white rounded-full hover:bg-blue-400 transition-colors shadow-sm"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
