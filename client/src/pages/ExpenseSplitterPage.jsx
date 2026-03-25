import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import ExpenseSplitter from '../components/ExpenseSplitter';
import { useNavigate } from 'react-router-dom';

export default function ExpenseSplitterPage() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await axios.get('/trip');
        const sorted = data.trips.sort((a,b) => new Date(b.date) - new Date(a.date));
        setTrips(sorted);
        if (sorted.length > 0) {
          setSelectedTripId(sorted[0]._id);
        }
      } catch (e) {
        console.error('Failed to fetch trips');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-80px)]"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-6xl mx-auto py-8 mb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold font-serif italic text-gray-900 mb-2">Expense Splitter</h1>
          <p className="text-gray-500 text-sm">Manage group finances, record shared expenses, and settle up easily.</p>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No trips found</h2>
          <p className="text-gray-500 text-sm mb-6">Create a trip first to start splitting expenses with your friends.</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors">Go to Dashboard</button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-6 justify-center rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
             <div className="text-sm font-semibold text-gray-700">Select Trip:</div>
             <select 
               value={selectedTripId} 
               onChange={(e) => setSelectedTripId(e.target.value)}
               className="flex-1 max-w-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 font-medium outline-none focus:border-blue-400"
             >
               {trips.map(t => (
                 <option key={t._id} value={t._id}>{t.title} - {new Date(t.date).toLocaleDateString()}</option>
               ))}
             </select>
          </div>

          {selectedTripId && <ExpenseSplitter tripId={selectedTripId} />}
        </div>
      )}
    </div>
  );
}
