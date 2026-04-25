import React, { useState, useEffect } from 'react';
import TripCard from '../components/TripCard';
import CreateTripModal from '../components/CreateTripModal';
import { Plus, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchTrips = async () => {
    try {
      const { data } = await axios.get('/trip');
      setTrips(data.trips);
    } catch (error) {
      toast.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 pt-4">
        <div>
          <h1 className="text-3xl md:text-[2.5rem] font-bold text-gray-900 leading-tight tracking-tight">
            Welcome back, {user?.name || 'Explorer'}!
          </h1>
          <p className="text-xl text-gray-800 font-medium mt-1">
            You have <span className="font-bold">{trips.length} {trips.length === 1 ? 'trip' : 'trips'}</span> logged.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-[#90caf9] hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md shadow-blue-200 transform hover:-translate-y-0.5 w-full md:w-auto"
        >
          <Plus size={20} />
          <span>New Trip</span>
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-700 mb-6">Your Trips</h2>

      {/* Grid or Empty State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Map size={40} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-500 max-w-sm mb-8">You haven't added any trips yet. Create your first adventure to get started!</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Create First Trip</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trips.map((trip) => (
            <div key={trip._id} onClick={() => navigate(`/trip/${trip._id}`)}>
              {/* Using a placeholder image if none exists since the schema doesn't specify an image field yet */}
              <TripCard 
                title={trip.title}
                description={trip.description}
                date={new Date(trip.date).toLocaleDateString()}
                image={trip.image || 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=600&q=80'}
                liked={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTripModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchTrips(); // Refresh list after create
        }} 
      />
    </div>
  );
};

export default Dashboard;
