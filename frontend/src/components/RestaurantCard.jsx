import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
    return (
        <Link to={`/restaurant/${restaurant.id}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
            <div className="relative h-48 overflow-hidden bg-gray-200">
                {restaurant.image_url ? (
                    <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 text-lg font-medium">
                        No Image
                    </div>
                )}
            </div>
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">{restaurant.name}</h2>
                    <div className="flex items-center bg-green-50 px-2 py-1 rounded-full text-green-700 font-semibold text-sm">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        <span>{restaurant.rating || "New"}</span>
                    </div>
                </div>
                <p className="text-gray-500 text-sm mb-3 font-medium">{restaurant.cuisine}</p>
                <div className="flex items-center text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{restaurant.address}</span>
                </div>
            </div>
        </Link>
    );
};

export default RestaurantCard;
