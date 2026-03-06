import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Clock, CheckCircle, Navigation, Truck } from 'lucide-react';

const RiderPortal = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return navigate('/login');

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!profileData || profileData.role !== 'delivery_partner') {
                navigate('/');
                return;
            }

            setProfile(profileData);
            fetchAvailableOrders();
        };
        checkAuth();
    }, [navigate]);

    const fetchAvailableOrders = async () => {
        try {
            const { data } = await supabase
                .from('orders')
                .select('*, restaurants(name, address)')
                .order('created_at', { ascending: false });

            setOrders(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimOrder = async (orderId) => {
        const { data: { session } } = await supabase.auth.getSession();
        try {
            await api.put(`/orders/${orderId}/status`, {
                status: 'delivering',
                rider_id: session.user.id
            });
            alert("Order claimed! Head to the restaurant.");
            fetchAvailableOrders();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header / Stats */}
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Rider Portal</h1>
                <p className="text-gray-600">Available delivery jobs and your performance stats.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 transition-all duration-200">
                    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                        <Truck size={24} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">12</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deliveries Today</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 transition-all duration-200">
                    <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">₹1,450</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Earnings Today</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 transition-all duration-200">
                    <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-orange-600">
                        <Clock size={24} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="text-red-600" />
                Available Jobs
            </h2>

            {orders.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    No orders currently waiting for pickup.
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="relative bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{order.restaurants?.name}</h3>
                                    <div className="space-y-1.5">
                                        <div className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                                            <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
                                            <span>Pickup: {order.restaurants?.address}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                                            <Navigation size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                            <span>Drop: Customer's delivery location</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right mr-4 hidden md:block">
                                        <div className="text-lg font-bold text-gray-900">₹{(order.total_amount * 0.1).toFixed(0)}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Your Share</div>
                                    </div>
                                    <button
                                        onClick={() => handleClaimOrder(order.id)}
                                        className="bg-red-600 hover:bg-black text-white px-6 py-3 rounded-lg font-bold transition-colors duration-200 shadow-sm"
                                    >
                                        Claim Job
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RiderPortal;
