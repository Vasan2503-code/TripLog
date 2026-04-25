import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Image as ImageIcon, Map, Trash2, Settings2, MessageSquare, Users } from 'lucide-react';
import AIBot from '../components/AIBot';
import ChatModal from '../components/ChatModal';
import ExpenseSplitter from '../components/ExpenseSplitter';
import axios, { BACKEND_URL } from '../api/axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getInitials } from '../utils/helpers';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [sharedLocations, setSharedLocations] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!id) return;
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);
    
    newSocket.emit('join-trip', id);
    
    newSocket.on('receive_location', (data) => {
      setSharedLocations(prev => [...prev, data]);
    });

    return () => {
      newSocket.off('receive_location');
      newSocket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        // Fetch trip details (Assuming GET /trip/:id exists or we filter from all trips for now)
        // Since backend doesn't have a specific getTripById, we'll fetch all and filter for demo
        const { data: tripsData } = await axios.get('/trip');
        const foundTrip = tripsData.trips.find(t => t._id === id);
        
        if (foundTrip) {
          setTrip(foundTrip);
          // Fetch members explicitly
          try {
            const { data: membersData } = await axios.get(`/trip/get-members/${id}`);
            // Note: GET /get-members returns the populated array in 'members'
            setMembers(membersData.members);
          } catch(err) {
            console.log("Error fetching members", err);
          }
        } else {
          toast.error("Trip not found");
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error("Error loading trip details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTripData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
         <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!trip) return null;

  const handleUploadClick = () => {
    document.getElementById('imageUpload').click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading('Uploading image...');
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const { data } = await axios.post('/upload-image/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { url, public_id } = data.data;
      
      await axios.post(`/trip/${id}/images`, { url, public_id });

      toast.success('Image Uploaded to Trip!', { id: toastId });
    } catch (error) {
      toast.error('Upload failed', { id: toastId });
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return;
    
    const toastId = toast.loading('Deleting trip...');
    try {
      await axios.delete(`/trip/delete-trip/${id}`);
      toast.success('Trip deleted successfully', { id: toastId });
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete trip', { id: toastId });
    }
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    const toastId = toast.loading('Fetching location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await axios.post('/location/post-location', {
            tripId: id,
            userId: user.id || user._id,
            userName: user.name || user.email,
            latitude,
            longitude
          });
          toast.success('Live location shared with group!', { id: toastId });
        } catch (error) {
          toast.error('Failed to share location', { id: toastId });
        }
      },
      (error) => {
        toast.error('Error fetching location', { id: toastId });
      }
    );
  };

  const handleAddMemberToTrip = async () => {
    if (!newMemberEmail) return;
    setAddingMember(true);
    const toastId = toast.loading('Adding member...');
    try {
      await axios.post(`/trip/add-members/${id}`, { email: newMemberEmail });
      toast.success('Member added!', { id: toastId });
      setNewMemberEmail('');
      const { data: membersData } = await axios.get(`/trip/get-members/${id}`);
      setMembers(membersData.members);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member', { id: toastId });
    } finally {
      setAddingMember(false);
    }
  };

  // Determine if current user is admin
  const isAdmin = trip.createdBy === user?.id;

  return (
    <div className="max-w-6xl mx-auto py-8 mb-20">
      <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 flex items-center transition-colors">
        ← Back to Dashboard
      </button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-3">
            <h1 className="text-4xl font-serif italic text-gray-900">{trip.title}</h1>
            {new Date(trip.date) < new Date() ? (
              <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Completed</span>
            ) : (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Active</span>
            )}
            {isAdmin && (
              <button 
                onClick={handleDeleteTrip}
                className="ml-auto flex items-center justify-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Trip"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
          
          <div className="flex items-center text-gray-500 space-x-6 mb-4 text-sm">
            <span className="flex items-center"><MapPin size={16} className="mr-1.5 text-blue-400" /> {trip.destination || 'No destination set'}</span>
            <span className="flex items-center"><Calendar size={16} className="mr-1.5 text-blue-400" /> {new Date(trip.date).toLocaleDateString()}</span>
          </div>
          
          <p className="text-gray-600 max-w-2xl leading-relaxed">
            {trip.description}
          </p>
        </div>
      </div>

      {/* Action Bar & Members List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Actions (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Trip Actions</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-5 py-4 rounded-xl font-medium flex items-center justify-center shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <MessageSquare size={20} className="mr-3" /> Chat with Friends
              </button>
              
              <button 
                onClick={handleUploadClick} 
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 px-5 py-4 rounded-xl font-medium flex items-center justify-center transition-all"
              >
                <ImageIcon size={20} className="mr-3" /> Upload Images
              </button>
              
              <button 
                onClick={handleLocationClick} 
                className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 px-5 py-4 rounded-xl font-medium flex items-center justify-center transition-all"
              >
                <Map size={20} className="mr-3" /> Share Location
              </button>

              {/* Hidden file input for Cloudinary */}
              <input 
                type="file" 
                id="imageUpload" 
                className="hidden" 
                onChange={handleImageUpload} 
                accept="image/*" 
              />
            </div>
          </div>
        </div>

        {/* Member List (Right Column) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Itinerary Group</h2>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{members.length} Members</span>
            </div>
            
            {isAdmin && (
              <div className="mb-4 flex space-x-2">
                <input 
                  type="email" 
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Invite via email..." 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 min-w-0"
                />
                <button 
                  onClick={handleAddMemberToTrip}
                  disabled={addingMember}
                  className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 shrink-0"
                >
                  {addingMember ? '...' : 'Add'}
                </button>
              </div>
            )}
            
            <div className="space-y-3">
              {members.length > 0 ? members.map(member => (
                <div key={member._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm">
                      {getInitials(member.name || member.email)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 max-w-[120px] truncate">{member.name}</p>
                      {trip.createdBy === member._id && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-sm font-bold uppercase mt-0.5 inline-block">Admin</span>}
                    </div>
                  </div>
                  {isAdmin && trip.createdBy !== member._id && (
                    <button 
                      onClick={async () => {
                        const toastId = toast.loading('Removing member...');
                        try {
                          await axios.delete(`/trip/delete-members/${id}`, { data: { email: member.email || member.name } });
                          toast.success('Member removed!', { id: toastId });
                          const { data: membersData } = await axios.get(`/trip/get-members/${id}`);
                          setMembers(membersData.members);
                        } catch (error) {
                          toast.error(error.response?.data?.message || 'Failed to remove member', { id: toastId });
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors tooltip" aria-label="Remove member">
                      <Trash2 size={16} />
                    </button>
                  )}
                  {trip.createdBy === member._id && (
                    <div className="text-gray-300 p-2">
                       <Settings2 size={16} />
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No other members in this trip yet.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {sharedLocations.length > 0 && (
        <div className="mt-8 bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="text-blue-500 mr-2" size={24} /> Shared Locations
          </h2>
          <div className="space-y-3">
            {sharedLocations.map((loc, idx) => (
              <a 
                key={idx} 
                href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="block p-4 rounded-xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900 flex flex-col sm:flex-row sm:items-center justify-start gap-y-2 gap-x-2">
                  <span className="whitespace-nowrap">📍 {loc.senderName} shared their location:</span>
                  <span className="text-xs text-blue-600 font-medium underline truncate hover:text-blue-800 transition-colors">
                     [{`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}]
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} tripId={id} />
      <AIBot destination={trip.destination} description={trip.description} />
      
      {/* Expense Splitter Section at the bottom */}
      <div className="mt-16">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">₹</div>
          <h2 className="text-2xl font-bold text-gray-900 font-serif italic">Expense Splitter</h2>
        </div>
        <ExpenseSplitter tripId={id} />
      </div>
    </div>
  );
};

export default TripDetails;
