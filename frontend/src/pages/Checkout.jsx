import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { supabase } from '../api/supabase';
import { CreditCard, Trash2, ArrowLeft, CheckCircle } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [restaurantId, setRestaurantId] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Not logged in, redirect to login
                navigate('/login?redirect=checkout');
                return;
            }
            const currentUserId = session.user.id;
            setUserId(currentUserId);

            // GUEST MIGRATION: If there's a guest cart, move it to the user's ID
            const guestCart = localStorage.getItem('cart_guest');
            const guestResId = localStorage.getItem('restaurant_id_guest');
            if (guestCart) {
                localStorage.setItem(`cart_${currentUserId}`, guestCart);
                localStorage.setItem(`restaurant_id_${currentUserId}`, guestResId);
                localStorage.removeItem('cart_guest');
                localStorage.removeItem('restaurant_id_guest');
            }

            // Load user-specific cart ONLY after we know who the user is
            const items = JSON.parse(localStorage.getItem(`cart_${currentUserId}`)) || [];
            const resId = localStorage.getItem(`restaurant_id_${currentUserId}`);

            // Handle if items is an object (from the new RestaurantMenu logic) or an array (legacy)
            const cartArray = Array.isArray(items) ? items : Object.values(items);

            setCartItems(cartArray);
            setRestaurantId(resId);

            const sum = cartArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            setTotal(sum);
        };

        checkUser();
    }, [navigate]);

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0 || !userId) return;
        setLoading(true);

        try {
            const payload = {
                user_id: userId,
                restaurant_id: restaurantId,
                // total_price is ignored by the new backend but kept for compatibility
                items: cartItems.map(item => ({
                    item_id: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await api.post('/orders', payload);
            localStorage.removeItem(`cart_${userId}`);
            localStorage.removeItem(`restaurant_id_${userId}`);
            navigate(`/order/${response.data.order.id}`);
        } catch (err) {
            console.error("Failed to place order", err);
            alert("Something went wrong. Please try again.");
            setLoading(false); // Reset loading so they can retry
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl shadow-sm border border-gray-100 mt-12 dark:bg-slate-800 dark:border-white/5 dark:shadow-none">
                <p className="text-2xl text-gray-500 font-bold mb-6 dark:text-slate-400">Your cart is empty.</p>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center text-red-600 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-full font-bold transition-colors dark:bg-red-500/10 dark:hover:bg-red-500/20"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Browse Restaurants
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center dark:text-white">
                <CheckCircle className="w-8 h-8 mr-3 text-green-500" /> Checkout
            </h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-white/5 dark:shadow-none">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Order Summary</h2>
                        <ul className="space-y-4">
                            {cartItems.map(item => (
                                <li key={item.id} className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 text-lg dark:text-white">{item.name}</span>
                                        <span className="text-sm text-gray-500 font-medium dark:text-slate-400">Qty: {item.quantity}</span>
                                    </div>
                                    <span className="font-bold text-gray-800 text-lg dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 h-fit sticky top-6 shadow-md dark:bg-slate-800 dark:border-white/5 dark:shadow-none">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Total</h2>
                    <div className="flex justify-between items-center mb-6 py-4 border-t border-b border-gray-200 dark:border-white/10">
                        <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white">Subtotal</span>
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
                    <p className="text-xs text-center text-gray-500 mt-4 font-medium flex items-center justify-center gap-1 dark:text-slate-400">
                        🔒 Secure Checkout Provided by DineDash
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
