import React, { useState, useEffect } from 'react';
import { Send, X, ShieldAlert } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const ChatModal = ({ isOpen, onClose, tripId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { user } = useAuth();
  // Using state to ensure socket persists properly during the modal lifecycle
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      // Fetch existing chat history
      const fetchHistory = async () => {
         try {
           const { data } = await axios.get(`/trip/chat/${tripId}`);
           setMessages(data);
         } catch(err) {
           console.error("Failed to load chat history", err);
         }
      };
      fetchHistory();

      // Connect to Socket.io backend
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket);

    // Join specific trip room
    newSocket.emit('join-trip', tripId, { name: user.name || user.email });

    // Listen for users joining
    newSocket.on('user_joined', (data) => {
      if (data?.name) {
        toast.success(`${data.name} joined the trip.`);
      }
    });

    // Listen for incoming messages
    newSocket.on('new-message', (message) => {
        setMessages((prev) => [...prev, message]);
        // Don't toast if it's our own optimistic message coming back
        if (message.sender?.name !== user?.name && message.sender?.email !== user?.email) {
            toast.success(`New message from ${message.sender?.name || message.sender?.email || 'someone'}`);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, tripId, user]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim() || !socket || !user) return;
    
    // Mongoose message model expects { tripId, senderId, message }
    const newMessage = { 
      tripId,
      senderId: user.id || user._id, 
      message: input
    };

    // Emit to backend
    socket.emit('message', newMessage);
    
    setInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[70vh]">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
          <div>
            <h3 className="font-bold text-gray-900">Trip Chat</h3>
            <span className="flex items-center text-xs text-green-600 font-medium mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> Live connection
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50/10 flex flex-col">
          {messages.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <ShieldAlert size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No messages yet. Say hi!</p>
             </div>
          )}
          {messages.map((msg, idx) => {
            const msgSenderId = msg.sender?._id || msg.sender;
            const currentUserId = user?.id || user?._id;
            const isMe = msgSenderId === currentUserId;
            
            const timeString = msg.createdAt 
                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-gray-400 mb-1 ml-1">{msg.sender?.name || 'User'} • {timeString}</span>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
                  isMe 
                    ? 'bg-[#90caf9] text-white rounded-tr-sm shadow-sm' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })}
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
    </div>
  );
};

export default ChatModal;
