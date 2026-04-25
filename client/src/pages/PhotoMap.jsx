import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Image as ImageIcon, Upload, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PhotoMap = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await axios.get('/trip');
        setTrips(data.trips);
        if (data.trips.length > 0) {
          setSelectedTripId(data.trips[0]._id);
        }
      } catch (error) {
        toast.error('Failed to fetch trips for Photo Map');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedTripId) return;

    setUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      // 1. Upload to Cloudinary
      const uploadRes = await axios.post('/upload-image/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { url, public_id } = uploadRes.data.data;

      // 2. Add to Trip
      const addImageRes = await axios.post(`/trip/${selectedTripId}/images`, { url, public_id });

      // Update local state to show new image instantly
      setTrips(prevTrips => prevTrips.map(trip => {
        if (trip._id === selectedTripId) {
          return { ...trip, images: [...(trip.images || []), { url, public_id }] };
        }
        return trip;
      }));

      toast.success('Image Uploaded to Trip!', { id: toastId });
    } catch (error) {
      toast.error('Upload failed', { id: toastId });
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const selectedTrip = trips.find(t => t._id === selectedTripId);

  return (
    <div className="max-w-6xl mx-auto py-8 mb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center mb-2">
            <ImageIcon className="text-pink-500 mr-3" size={36} /> Photo Map
          </h1>
          <p className="text-gray-500 font-medium">Relive your memories, organized by trip.</p>
        </div>

        <div className="mt-6 md:mt-0 w-full md:w-auto flex items-center space-x-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium appearance-none cursor-pointer"
            >
              <option value="" disabled>Select a trip</option>
              {trips.map(trip => (
                <option key={trip._id} value={trip._id}>{trip.title}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
             <button 
                disabled={!selectedTripId || uploading}
                onClick={() => document.getElementById('photoMapUpload').click()}
                className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer"
             >
                {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <><Upload size={20} className="mr-2" /> Upload</>
                )}
             </button>
             <input 
                type="file" 
                id="photoMapUpload" 
                className="hidden" 
                onChange={handleImageUpload} 
                accept="image/*" 
              />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
      ) : selectedTrip ? (
        <div>
          {selectedTrip.images && selectedTrip.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {selectedTrip.images.map((img, idx) => (
                <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <img 
                    src={img.url} 
                    alt={`Trip moment ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                     <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100">
                        Uploaded on {new Date(img.uploadedAt || Date.now()).toLocaleDateString()}
                     </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                <ImageIcon size={40} className="text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No photos yet</h3>
              <p className="text-gray-500 max-w-sm mb-8">This trip doesn't have any memories saved. Upload the first photo!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-3xl border border-dashed border-gray-200">
          Please select or create a trip to view and upload photos.
        </div>
      )}
    </div>
  );
};

export default PhotoMap;
