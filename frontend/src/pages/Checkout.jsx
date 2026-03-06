import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CreditCard, Trash2, ArrowLeft, CheckCircle } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [restaurantId, setRestaurantId] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem('cart')) || [];
        const resId = localStorage.getItem('restaurant_id');
        setCartItems(items);
        setRestaurantId(resId);

        const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum);
    }, []);

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);

        try {
            // Note: In a real app we'd get the user_id from auth context.
            // Sending a mock UUID here that passes the uuid format or handle it depending on backend auth logic
            const payload = {
                restaurant_id: restaurantId,
                total_price: total,
                items: cartItems.map(item => ({
                    item_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await api.post('/orders', payload);
            localStorage.removeItem('cart');
            localStorage.removeItem('restaurant_id');
            navigate(`/order/${response.data.order.id}`);
        } catch (err) {
            console.error("Failed to place order", err);
            alert("Error placing order. Ensure backend supports the user_id or test mock data structure.");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl shadow-sm border border-gray-100 mt-12">
                <p className="text-2xl text-gray-500 font-bold mb-6">Your cart is empty.</p>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center text-red-600 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-full font-bold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Browse Restaurants
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
                <CheckCircle className="w-8 h-8 mr-3 text-green-500" /> Checkout
            </h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
                        <ul className="space-y-4">
                            {cartItems.map(item => (
                                <li key={item.id} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 text-lg">{item.name}</span>
                                        <span className="text-sm text-gray-500 font-medium">Qty: {item.quantity}</span>
                                    </div>
                                    <span className="font-bold text-gray-800 text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 h-fit sticky top-6 shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Total</h2>
                    <div className="flex justify-between items-center mb-6 py-4 border-t border-b border-gray-200">
                        <span className="text-xl md:text-2xl font-bold text-gray-700">Subtotal</span>
                        <span className="text-2xl md:text-3xl font-extrabold text-green-700">${total.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className={`w-full py-4 text-white font-bold text-lg rounded-2xl flex items-center justify-center transition-all ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-xl hover:-translate-y-1'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">Processing <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div></span>
                        ) : (
                            <span className="flex items-center gap-2">Place Order <CreditCard className="w-6 h-6 ml-2" /></span>
                        )}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-4 font-medium flex items-center justify-center gap-1">
                        🔒 Secure Checkout Provided by DineDash
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
