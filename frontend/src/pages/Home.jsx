import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';
import { Search } from 'lucide-react';

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/restaurants');
                setRestaurants(response.data || []);
            } catch (err) {
                console.error("Failed to fetch restaurants", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const cuisines = ['All', ...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];

    const filteredRestaurants = restaurants.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.cuisine?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCuisine = selectedCuisine === 'All' || r.cuisine === selectedCuisine;
        return matchesSearch && matchesCuisine;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-90 mix-blend-multiply"></div>
                <div className="relative px-8 py-20 lg:p-32 flex flex-col items-center text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
                        Hungry? We’ve Got You Covered.
                    </h1>
                    <p className="text-xl md:text-2xl text-red-50 mb-10 max-w-2xl text-shadow-sm font-medium">
                        Order from the best local restaurants with easy, on-demand delivery.
                    </p>
                    <div className="relative w-full max-w-xl group flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-6 w-6 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="w-full py-4 pl-12 pr-4 bg-white/95 backdrop-blur-sm text-gray-900 rounded-2xl shadow-lg border-2 border-transparent focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 text-lg placeholder-gray-500 transition-all font-medium"
                                placeholder="Search restaurants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="py-4 px-6 bg-white/95 backdrop-blur-sm text-gray-900 rounded-2xl shadow-lg border-2 border-transparent focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 text-lg font-medium outline-none"
                            value={selectedCuisine}
                            onChange={(e) => setSelectedCuisine(e.target.value)}
                        >
                            {cuisines.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Featured Restaurants</h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filteredRestaurants.length} Places</span>
                </div>

                {filteredRestaurants.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-16 text-center border border-gray-100">
                        <p className="text-xl text-gray-500 font-medium">No restaurants found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredRestaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Home;
