import React from 'react';
import { Heart } from 'lucide-react';

const TripCard = ({ image, title, date, description, liked }) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-50/50 flex flex-col h-full">
      <div className="relative h-48 w-full p-3 pb-0">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
      <div className="p-5 pt-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-serif italic text-gray-900 leading-tight">{title}</h3>
          <button className="text-[#e5bba1] hover:scale-110 transition-transform">
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} className={liked ? 'text-[#e5bba1]' : 'text-gray-300'} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3 font-medium">{date}</p>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed flex-grow">{description}</p>
      </div>
    </div>
  );
};

export default TripCard;
