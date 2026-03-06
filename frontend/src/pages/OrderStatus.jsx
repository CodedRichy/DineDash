import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Package, Clock, Truck, CheckCircle2, ArrowLeft } from 'lucide-react';

const OrderStatus = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${id}`);
                setOrder(response.data);
            } catch (err) {
                console.error("Failed to fetch order", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // Polling every 10 seconds to simulate real-time
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading && !order) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
        </div>
    );

    if (!order) return (
        <div className="text-center p-12 text-gray-500 font-medium bg-gray-50 rounded-2xl mx-auto max-w-lg mt-12 border">
            Order not found
        </div>
    );

    const statuses = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    const currentStatusIndex = statuses.indexOf(order.status);

    const getStatusIcon = (statusName, index) => {
        const isActive = index <= currentStatusIndex;
        const color = isActive ? "bg-green-500 shadow-green-500/40" : "bg-gray-200";
        const iconColor = isActive ? "text-white" : "text-gray-400";

        const renderIcon = () => {
            switch (statusName) {
                case 'pending': return <span className={`flex items-center justify-center p-3 rounded-xl m-1 ${color} shadow-lg transition-transform ${isActive ? 'scale-110' : ''}`}><Package className={iconColor} size={24} /></span>;
                case 'preparing': return <span className={`flex items-center justify-center p-3 rounded-xl m-1 ${color} shadow-lg transition-transform ${isActive ? 'scale-110' : ''}`}><Clock className={iconColor} size={24} /></span>;
                case 'out_for_delivery': return <span className={`flex items-center justify-center p-3 rounded-xl m-1 ${color} shadow-lg transition-transform ${isActive ? 'scale-110' : ''}`}><Truck className={iconColor} size={24} /></span>;
                case 'delivered': return <span className={`flex items-center justify-center p-3 rounded-xl m-1 ${color} shadow-lg transition-transform ${isActive ? 'scale-110' : ''}`}><CheckCircle2 className={iconColor} size={24} /></span>;
                case 'cancelled': return <span className={`flex items-center justify-center p-3 rounded-xl m-1 bg-red-500 shadow-red-500/40 shadow-lg`}><span className="text-white font-bold p-1">X</span></span>;
                default: return null;
            }
        };

        return (
            <div key={statusName} className="flex flex-col items-center relative z-10 w-full">
                {renderIcon()}
                <p className={`text-sm md:text-base font-bold capitalize mt-3 truncate ${isActive ? 'text-green-700' : 'text-gray-400'}`}>
                    {statusName.replace('_', ' ')}
                </p>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-500 hover:text-green-600 mb-2 font-bold transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Home
            </button>
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <CheckCircle2 size={200} />
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 font-medium mb-10 text-lg">Order ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded-md">{order.id.slice(0, 8)}...</span></p>

                <div className="my-16 mx-auto w-full max-w-2xl relative">
                    <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 lg:top-8 -z-10 rounded-full">
                        {currentStatusIndex >= 0 && (
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-in-out"
                                style={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 2)) * 100}%` }}
                            ></div>
                        )}
                    </div>

                    <div className="flex justify-between items-start gap-2">
                        {statuses.filter(s => s !== 'cancelled').map((status, index) => getStatusIcon(status, index))}
                        {order.status === 'cancelled' && getStatusIcon('cancelled', 4)}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 relative z-10">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                        Receipt
                    </h2>
                    <ul className="space-y-4">
                        {order.order_items?.map(item => (
                            <li key={item.id} className="flex justify-between items-center text-gray-700 py-3 border-b border-gray-200 last:border-0 last:pb-0">
                                <div>
                                    <span className="font-bold text-gray-900 block">{item.menu_items?.name}</span>
                                    <span className="text-sm font-medium text-gray-500 bg-white border border-gray-100 px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                                </div>
                                <span className="font-bold text-gray-800 block">${(item.price_at_time_of_order * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                        <span className="text-lg font-bold text-gray-900">Total Paid</span>
                        <span className="text-3xl font-black text-green-600">${order.total_price}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatus;
