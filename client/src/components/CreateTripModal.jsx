import React, { useState } from 'react';
import { X, Plus, Users, Map, Calendar, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const MOCK_TRIPS = [
  {
    id: 1,
    title: 'Sunset over Santorini',
    date: 'June 2024',
    description: 'Beautiful sunset views from the cliffside villages, exploring the white washed houses.',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=600&q=80',
    liked: true
  },
  {
    id: 2,
    title: 'Kyoto Gardens',
    date: 'April 2024',
    description: 'Wandering through the serene bamboo forests and witnessing the spring cherry blossoms.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    liked: true
  },
  {
    id: 3,
    title: 'Italian Adventure',
    date: 'September 2023',
    description: 'Exploring the ancient ruins in Rome and enjoying authentic pasta dishes.',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    liked: true
  },
  {
    id: 4,
    title: 'Swiss Alps Hiking',
    date: 'August 2023',
    description: 'Trekking through the breathtaking mountain passes and crystal clear lakes.',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
    liked: true
  }
];

const CreateTripModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ title: '', destination: '', date: '', description: '', members: [] });
  const [newMember, setNewMember] = useState({ email: '' });

  if (!isOpen) return null;

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);
  
  const handleAddMember = () => {
    if (newMember.email) {
      setFormData(prev => ({ ...prev, members: [...prev.members, newMember] }));
      setNewMember({ email: '' });
    }
  };

  const handleCreate = async () => {
    const toastId = toast.loading('Creating trip...');
    try {
      const { data } = await axios.post('/trip/create-trip', { 
        title: formData.title,
        destination: formData.destination,
        date: formData.date,
        description: formData.description
      });
      toast.success('Trip created successfully!', { id: toastId });
      
      if (formData.members && formData.members.length > 0) {
        for (const member of formData.members) {
           await axios.post(`/trip/add-members/${data.newTrip._id}`, { email: member.email });
        }
      }

      onClose();
      setStep(1);
      setFormData({ title: '', destination: '', date: '', description: '', members: [] });
    } catch (error) {
       toast.error(error.response?.data?.message || 'Failed to create trip', { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 1 ? 'Trip Details' : 'Add Members'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Type size={16} className="mr-2 text-blue-400" /> Title
                </label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white outline-none transition-all" 
                  placeholder="e.g., Summer in Paris" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Map size={16} className="mr-2 text-blue-400" /> Destination
                  </label>
                  <input 
                    type="text" 
                    value={formData.destination}
                    onChange={e => setFormData({...formData, destination: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white outline-none transition-all" 
                    placeholder="City, Country" 
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="mr-2 text-blue-400" /> Date
                  </label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white outline-none transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white outline-none transition-all h-24 resize-none" 
                  placeholder="What's this trip about?" 
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">Add friends to collaborate on your itinerary, share photos in real-time, and chat!</p>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input 
                      type="email" 
                      value={newMember.email}
                      onChange={e => setNewMember({...newMember, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all text-sm" 
                      placeholder="User Email" 
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddMember}
                    className="bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {formData.members.length > 0 && (
                  <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
                    {formData.members.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-50 bg-gray-50/30 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {m.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{m.email}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Added</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between">
          {step === 2 ? (
            <button onClick={handleBack} className="px-6 py-2.5 text-gray-600 font-medium hover:text-gray-900 transition-colors">
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          {step === 1 ? (
            <button 
              onClick={handleNext} 
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-md flex items-center"
            >
              Continue <Users size={16} className="ml-2" />
            </button>
          ) : (
            <button 
              onClick={handleCreate} 
              className="px-8 py-2.5 bg-[#90caf9] text-white font-medium rounded-xl hover:bg-blue-400 transition-colors shadow-md shadow-blue-200"
            >
              Create Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTripModal;
export { MOCK_TRIPS };
