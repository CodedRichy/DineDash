import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { supabase } from '../api/supabase';
import { Plus, Minus, ArrowLeft, Star, ShoppingBag, MapPin, Utensils } from 'lucide-react';

const RestaurantMenu = () => {
    const id = useParams().id;
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({});
    const [profile, setProfile] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserId = session?.user?.id || 'guest';
            setUserId(currentUserId);

            if (session?.user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setProfile(data);
            }

            // Load cart (User-specific or Guest)
            const savedCart = JSON.parse(localStorage.getItem(`cart_${currentUserId}`)) || {};
            const savedResId = localStorage.getItem(`restaurant_id_${currentUserId}`);
            if (savedResId === id) {
                setCart(savedCart);
            }

            try {
                const [resResponse, menuResponse] = await Promise.all([
                    api.get(`/restaurants/${id}`),
                    api.get(`/menu/${id}`)
                ]);
                setRestaurant(resResponse.data);
                setMenuItems(menuResponse.data || []);
            } catch (err) {
                console.error("Failed to fetch menu", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const addToCart = (item) => {
        const currentId = userId || 'guest';
        const savedResId = localStorage.getItem(`restaurant_id_${currentId}`);

        // Conflict Check: If items exist from another restaurant
        if (savedResId && savedResId !== id && Object.keys(cart).length > 0) {
            const confirmClear = window.confirm("Your cart contains items from another restaurant. Clear cart and start fresh?");
            if (!confirmClear) return;

            // Clear old cart
            const newCart = { [item.id]: { ...item, quantity: 1 } };
            setCart(newCart);
            localStorage.setItem(`cart_${currentId}`, JSON.stringify(newCart));
            localStorage.setItem(`restaurant_id_${currentId}`, id);
            return;
        }

        setCart(prev => {
            const newCart = {
                ...prev,
                [item.id]: {
                    ...item,
                    quantity: (prev[item.id]?.quantity || 0) + 1
                }
            };
            localStorage.setItem(`cart_${currentId}`, JSON.stringify(newCart));
            localStorage.setItem(`restaurant_id_${currentId}`, id);
            return newCart;
        });
    };

    const removeFromCart = (itemId) => {
        const currentId = userId || 'guest';
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[itemId].quantity > 1) {
                newCart[itemId].quantity -= 1;
            } else {
                delete newCart[itemId];
            }
            localStorage.setItem(`cart_${currentId}`, JSON.stringify(newCart));
            return newCart;
        });
    };

    const cartItemCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

    const proceedToCheckout = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return navigate('/login?redirect=checkout');

        const cartItems = Object.values(cart);
        if (cartItems.length > 0) {
            localStorage.setItem(`cart_${session.user.id}`, JSON.stringify(cart));
            localStorage.setItem(`restaurant_id_${session.user.id}`, id);
            navigate('/checkout');
        }
    };

    const isConsumer = !profile || profile.role === 'consumer';

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
        </div>
    );

    if (!restaurant) return (
        <div className="text-center p-12 text-gray-500 font-medium">Restaurant not found</div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-red-600 mb-6 font-medium transition"
            >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Restaurants
            </button>

            <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 mb-8 relative">
                {restaurant.image_url && (
                    <div className="h-64 md:h-80 w-full relative">
                        <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
                            <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight drop-shadow-lg">{restaurant.name}</h1>
                            <div className="flex items-center space-x-4">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                                    {restaurant.rating || "New"}
                                </span>
                                <span className="text-white/90 font-medium bg-black/40 px-3 py-1 rounded-full text-sm">
                                    {restaurant.cuisine}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <div className="p-6 md:p-8 flex items-start gap-4 text-gray-600 bg-gray-50/50">
                    <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-lg font-medium">{restaurant.address}</p>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Utensils className="w-7 h-7 text-red-500" /> Menu
                </h2>
                {menuItems.length === 0 ? (
                    <div className="bg-white border text-center p-12 rounded-2xl">
                        <p className="text-gray-500 text-lg font-medium">No menu items available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {menuItems.map(item => (
                            <div key={item.id} className="flex bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
                                <div className="flex-grow pr-4 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                                        <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">{item.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-lg font-bold text-green-700">${Number(item.price).toFixed(2)}</span>
                                        {isConsumer && (
                                            <div className="flex items-center space-x-3 bg-gray-50 rounded-full border p-1 shadow-sm">
                                                {cart[item.id] ? (
                                                    <>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="p-1.5 hover:bg-white rounded-full transition hover:text-red-500 text-gray-600 shadow-sm"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="w-6 text-center font-bold text-gray-900">{cart[item.id].quantity}</span>
                                                        <button
                                                            onClick={() => addToCart(item)}
                                                            className="p-1.5 hover:bg-white rounded-full transition hover:text-green-500 text-gray-600 shadow-sm"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="px-4 py-1.5 bg-white text-red-600 hover:text-white hover:bg-red-600 rounded-full font-bold transition-colors shadow-sm text-sm flex items-center gap-1"
                                                    >
                                                        <Plus size={16} /> Add
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {item.image_url && (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-28 h-28 object-cover rounded-xl shadow-sm shrink-0 border border-gray-50"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {cartItemCount > 0 && isConsumer && (
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 md:p-6 border-t z-50 animate-slide-up">
                    <div className="container mx-auto max-w-5xl flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 font-semibold mb-0.5">Your Order</p>
                            <p className="text-2xl font-bold text-gray-900">{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</p>
                        </div>
                        <button
                            onClick={proceedToCheckout}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" /> View Cart & Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// end of component
export default RestaurantMenu;
