import React, { useState } from 'react';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const AIBot = ({ destination, description }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const { data } = await axios.post('/location-suggestions', {
         location: destination || 'Unknown location',
         preferences: `Trip Context: ${description || 'None'}. User Query: ${query}`
      });
      // The backend returns markdown formatted text, we'll just mock parse it for simple UI bullets
      const fetchedSuggestions = data.suggestions.split('\n').filter(s => s.trim() !== '');
      setSuggestions(fetchedSuggestions.slice(0, 3)); // show top 3
    } catch(err) {
      if (err.response) {
        console.log(`AI Suggestion Error: ${err.response.status}`);
        if (err.response.status === 401) console.log("Unauthorized: Check API keys or Auth headers.");
        if (err.response.status === 404) console.log("Not Found: Check the backend route /location-suggestions.");
        if (err.response.status === 500) console.log("Server Error: Likely Gemini API error or backend crash.");
      } else {
        console.log('AI Suggestion Network Error', err.message);
      }
      toast.error('AI Suggestion failed');
      setSuggestions(['No suggestions available for this destination']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-gray-100 transform transition-all origin-bottom-right">
          <div className="flex items-center text-blue-500 mb-3 font-medium text-sm border-b border-gray-100 pb-2">
            <Sparkles size={16} className="mr-2" /> AI Assistant
          </div>
          
          <div className="mb-4 h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center h-full text-blue-500 text-sm font-medium animate-pulse space-x-2">
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                 <span>Thinking...</span>
              </div>
            ) : suggestions.length > 0 ? suggestions.map((s, idx) => (
              <div key={idx} className="bg-blue-50/50 text-gray-700 text-sm p-3 rounded-xl border border-blue-50">
                {s.replace(/\*/g, '')}
              </div>
            )) : (
               <p className="text-gray-400 text-sm text-center mt-10">Ask me for local highlights or itinerary tips!</p>
            )}
          </div>
          
          <div className="bg-gray-50 border border-gray-200 shadow-inner rounded-full p-1.5 flex items-center pr-2">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-xs px-2"
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            />
            <button 
              onClick={handleAsk}
              className="ml-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center shrink-0"
              disabled={loading}
            >
              {loading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all text-white animate-bounce"
        style={{ animationDuration: '2s' }}
      >
        <Bot size={28} />
      </button>
    </div>
  );
};

export default AIBot;
