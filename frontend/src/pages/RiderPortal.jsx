import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Clock, CheckCircle, Navigation, Truck, Check } from 'lucide-react';

const RiderPortal = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login?redirect=rider');
                return;
            }

            try {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                console.log('[RIDER] User profile:', profileData);
                console.log('[RIDER] User role:', profileData?.role);

                if (!profileData || profileData.role !== 'delivery_partner') {
                    console.log('[RIDER] Not a delivery partner, redirecting...');
                    navigate('/');
                    return;
                }

                setProfile(profileData);
                fetchAvailableOrders();
            } catch (err) {
                console.error('[RIDER] Auth check failed:', err);
                navigate('/');
            }
        };
        checkAuth();
    }, [navigate]);

    const fetchAvailableOrders = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const riderId = session.user.id;
            console.log('[RIDER] Fetching orders for rider:', riderId);

            // Use API endpoint instead of direct Supabase query
            const response = await api.get('/orders/rider/available');
            const allOrders = response.data || [];
            
            console.log('[RIDER] API response:', allOrders);
            
            // Separate available orders and rider's active deliveries
            const availableOrders = allOrders.filter(order => order.status === 'preparing');
            const activeDeliveries = allOrders.filter(order => 
                order.status === 'out_for_delivery' && order.rider_id === riderId
            );
            
            console.log('[RIDER] Available orders:', availableOrders.length);
            console.log('[RIDER] Active deliveries:', activeDeliveries.length);

            setOrders(availableOrders);
            setMyDeliveries(activeDeliveries);
        } catch (err) {
            console.error('[RIDER] Error fetching orders:', err);
            console.error('[RIDER] Error response:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimOrder = async (orderId) => {
        const { data: { session } } = await supabase.auth.getSession();
        try {
            await api.put(`/orders/${orderId}/status`, {
                status: 'out_for_delivery',
                rider_id: session.user.id
            });
            alert('Order claimed! Head to the restaurant for pickup.');
            fetchAvailableOrders();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to claim order');
        }
    };

    const handleMarkDelivered = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/status`, {
                status: 'delivered'
            });
            alert('Order marked as delivered!');
            fetchAvailableOrders();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to update delivery status');
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Rider Portal</h1>
                <p className="text-gray-600 dark:text-slate-400">Available delivery jobs and your active deliveries.</p>
            </div>

            {/* Active Deliveries Section */}
            {myDeliveries.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Navigation className="text-blue-600" />
                        My Active Deliveries
                    </h2>
                    <div className="space-y-4">
                        {myDeliveries.map(order => (
                            <div key={order.id} className="relative bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 p-6 rounded-xl shadow-sm">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                                        Out for Delivery
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
                                                <span>Deliver to: Customer</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-500">
                                            {order.order_items?.reduce((sum, i) => sum + i.quantity, 0)} items · ${order.total_price}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleMarkDelivered(order.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors duration-200 shadow-sm flex items-center gap-2"
                                        >
                                            <Check className="w-5 h-5" />
                                            Mark Delivered
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Jobs Section */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Package className="text-red-600" />
                Available Jobs
            </h2>

            {orders.length === 0 ? (
                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-white/5 p-12 text-center text-gray-500 dark:text-slate-400">
                    No orders currently waiting for pickup.
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="relative bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                                    Ready for Pickup
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
                                            <span>Drop: Customer&apos;s delivery location</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm text-gray-500">
                                        {order.order_items?.reduce((sum, i) => sum + i.quantity, 0)} items · ${order.total_price}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right mr-4 hidden md:block">
                                        <div className="text-lg font-bold text-gray-900">${Math.round(order.total_price * 0.1)}</div>
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
