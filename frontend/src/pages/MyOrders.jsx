import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { supabase } from '../api/supabase';
import { Package, Clock, Truck, CheckCircle, ChevronRight, ShoppingBag } from 'lucide-react';

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login?redirect=orders');
                return;
            }

            try {
                console.log('[MyOrders] Fetching orders...');
                console.log('[MyOrders] User ID:', session.user.id);
                setError(null);
                
                // First test the backend connection
                console.log('[MyOrders] Testing backend connection...');
                const testResponse = await api.get('/orders/test');
                console.log('[MyOrders] Test response:', testResponse.data);
                
                // Now fetch actual orders
                const response = await api.get('/orders/my/orders');
                console.log('[MyOrders] Response:', response.data);
                setOrders(response.data || []);
            } catch (err) {
                console.error('[MyOrders] Failed to fetch orders:', err);
                console.error('[MyOrders] Error response:', err.response?.data);
                console.error('[MyOrders] Error status:', err.response?.status);
                setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [navigate]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-orange-500" />;
            case 'preparing':
                return <Package className="w-5 h-5 text-blue-500" />;
            case 'out_for_delivery':
                return <Truck className="w-5 h-5 text-purple-500" />;
            case 'delivered':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-orange-100 text-orange-700';
            case 'preparing':
                return 'bg-blue-100 text-blue-700';
            case 'out_for_delivery':
                return 'bg-purple-100 text-purple-700';
            case 'delivered':
                return 'bg-green-100 text-green-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'pending':
                return 'Waiting for restaurant to accept';
            case 'preparing':
                return 'Restaurant is preparing your order';
            case 'out_for_delivery':
                return 'Rider is on the way';
            case 'delivered':
                return 'Delivered successfully';
            case 'cancelled':
                return 'Order was cancelled';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-red-600" />
                    My Orders
                </h1>
                <span className="text-gray-500 dark:text-slate-400 font-medium">
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                </span>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-16 text-center border border-gray-100 dark:border-white/5 shadow-sm">
                    <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 dark:text-slate-400 mb-2">No orders yet</h3>
                    <p className="text-gray-400 dark:text-slate-500 mb-6">Start ordering from your favorite restaurants!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
                    >
                        Browse Restaurants
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700">
                                        {order.restaurants?.image_url ? (
                                            <img
                                                src={order.restaurants.image_url}
                                                alt={order.restaurants.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                            {order.restaurants?.name || 'Unknown Restaurant'}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">
                                            {new Date(order.created_at).toLocaleDateString()} at{' '}
                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-xl text-gray-900 dark:text-white">
                                        ${order.total_price}
                                    </p>
                                    <span className="text-xs text-gray-400 dark:text-slate-500">
                                        {order.order_items?.reduce((sum, i) => sum + i.quantity, 0)} items
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(order.status)}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                                    {getStatusMessage(order.status)}
                                </p>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>

                            {order.order_items && order.order_items.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-50 dark:border-white/5">
                                    <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-1">
                                        {order.order_items.map(i => `${i.quantity}x ${i.menu_items?.name}`).join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
