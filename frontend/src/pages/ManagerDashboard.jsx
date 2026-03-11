import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { supabase } from '../api/supabase';
import { Package, Utensils, Edit, Trash2, Save, X, Clock, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    // Menu form state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '', price: '', category: '', is_available: true, image_url: '' });

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!profileData || profileData.role !== 'manager') {
                navigate('/');
                return;
            }

            if (!profileData.managed_restaurant_id) {
                alert("No restaurant assigned to this manager account.");
                navigate('/');
                return;
            }

            setProfile(profileData);
            fetchRestaurantData(profileData.managed_restaurant_id);
        };
        checkAuth();
    }, [navigate]);

    const fetchRestaurantData = async (resId) => {
        try {
            const resData = await api.get(`/restaurants`);
            const myRes = resData.data.find(r => r.id === resId);
            setRestaurant(myRes);

            const [ordersRes, menuRes] = await Promise.all([
                api.get(`/orders/admin/${resId}`),
                api.get(`/menu/${resId}`)
            ]);
            setOrders(ordersRes.data || []);
            setMenu(menuRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMenu = async (e) => {
        e.preventDefault();
        try {
            if (isEditing && editForm.id) {
                await api.put(`/menu/${editForm.id}`, editForm);
            } else {
                await api.post(`/menu`, { ...editForm, restaurant_id: restaurant.id });
            }
            // Refresh menu
            const menuRes = await api.get(`/menu/${restaurant.id}`);
            setMenu(menuRes.data || []);
            setEditForm({ name: '', description: '', price: '', category: '', is_available: true, image_url: '' });
            setIsEditing(false);
        } catch (err) {
            console.error("Error saving menu item", err);
        }
    };

    const handleDeleteMenu = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/menu/${id}`);
            const menuRes = await api.get(`/menu/${restaurant.id}`);
            setMenu(menuRes.data || []);
        } catch (err) {
            console.error("Error deleting", err);
        }
    };

    if (loading) return <div className="p-12 text-center text-lg font-bold">Loading Storefront...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8">
            <header className="mb-10 flex justify-between items-center bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600">
                        <img src={restaurant?.image_url} alt={restaurant?.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">{restaurant?.name}</h1>
                        <p className="text-gray-500 font-medium flex items-center dark:text-slate-400">
                            <Store className="w-4 h-4 mr-2" />
                            {restaurant?.cuisine} Storefront
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center px-8 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'orders' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 dark:bg-slate-800 dark:text-white dark:border-white/5 dark:hover:bg-slate-700'}`}
                >
                    <Package className="w-5 h-5 mr-3" /> Live Orders
                </button>
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`flex items-center px-8 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'menu' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 dark:bg-slate-800 dark:text-white dark:border-white/5 dark:hover:bg-slate-700'}`}
                >
                    <Utensils className="w-5 h-5 mr-3" /> Edit Menu
                </button>
            </div>

            {activeTab === 'orders' && (
                <div className="grid gap-6">
                    {orders.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-100 dark:border-white/5">
                            <p className="text-gray-400 dark:text-slate-400 font-bold text-lg">Waiting for your first order...</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <span className="text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Order ID</span>
                                            <span className="font-mono text-gray-900 font-bold">#{order.id.slice(0, 8)}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {new Date(order.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-black px-4 py-2 rounded-xl text-sm uppercase ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                            order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <p className="font-black text-2xl text-gray-900 mt-2">${order.total_price}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <p className="font-bold text-gray-900 mb-4 h-6 border-b border-gray-200">Order Items</p>
                                    <ul className="space-y-3">
                                        {order.order_items?.map(i => (
                                            <li key={i.id} className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-200 text-xs font-black mr-3">{i.quantity}x</span>
                                                    <span className="font-bold text-gray-700">{i.menu_items?.name}</span>
                                                </div>
                                                <span className="font-bold text-gray-500">${(i.price_at_time_of_order * i.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'menu' && (
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5 sticky top-32">
                            <h2 className="text-2xl font-black mb-8 text-gray-900 dark:text-white">
                                {isEditing ? 'Edit Dish' : 'Add New Dish'}
                            </h2>
                            <form onSubmit={handleSaveMenu} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-tighter">Item Name</label>
                                    <input
                                        className="w-full bg-gray-50 dark:bg-slate-900 border-0 dark:border dark:border-slate-700 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-red-500 outline-none dark:text-white dark:placeholder-slate-400"
                                        placeholder="e.g. Spicy Miso Ramen" required
                                        value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-tighter">Price ($)</label>
                                    <input
                                        className="w-full bg-gray-50 dark:bg-slate-900 border-0 dark:border dark:border-slate-700 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-red-500 outline-none dark:text-white dark:placeholder-slate-400"
                                        placeholder="0.00" type="number" step="0.01" required
                                        value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-tighter">Category</label>
                                    <input
                                        className="w-full bg-gray-50 dark:bg-slate-900 border-0 dark:border dark:border-slate-700 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-red-500 outline-none dark:text-white dark:placeholder-slate-400"
                                        placeholder="e.g. Appetizer"
                                        value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-tighter">Description</label>
                                    <textarea
                                        className="w-full bg-gray-50 dark:bg-slate-900 border-0 dark:border dark:border-slate-700 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-red-500 outline-none dark:text-white dark:placeholder-slate-400"
                                        placeholder="Describe your dish..." rows="3"
                                        value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-tighter">Image URL</label>
                                    <input
                                        className="w-full bg-gray-50 dark:bg-slate-900 border-0 dark:border dark:border-slate-700 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-red-500 outline-none dark:text-white dark:placeholder-slate-400"
                                        placeholder="https://images.unsplash.com/..."
                                        value={editForm.image_url || ''} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })}
                                    />
                                </div>
                                <label className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl cursor-pointer">
                                    <input type="checkbox" checked={editForm.is_available} onChange={e => setEditForm({ ...editForm, is_available: e.target.checked })} className="w-6 h-6 rounded-lg accent-red-600" />
                                    <span className="font-bold text-gray-700 dark:text-white">Available to customers</span>
                                </label>

                                <div className="flex space-x-3 pt-4">
                                    <button type="submit" className="flex-1 bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl flex items-center justify-center transition-all shadow-lg">
                                        <Save className="w-5 h-5 mr-2" /> Save Dish
                                    </button>
                                    {isEditing && (
                                        <button type="button" onClick={() => { setIsEditing(false); setEditForm({ name: '', description: '', price: '', category: '', is_available: true, image_url: '' }); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-5 rounded-2xl transition-colors">
                                            <X className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {menu.map(item => (
                                <div key={item.id} className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border shadow-sm flex flex-col hover:shadow-md transition-all ${!item.is_available ? 'opacity-50 grayscale' : 'border-gray-100 dark:border-white/5'}`}>
                                    <div className="flex gap-4 items-start mb-6 flex-grow">
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">{item.name}</h3>
                                                <span className="font-black text-xl text-green-600 bg-green-50 dark:bg-green-500/15 dark:text-green-400 px-3 py-1 rounded-xl">${item.price}</span>
                                            </div>
                                            <p className="text-gray-500 dark:text-slate-400 font-medium text-sm line-clamp-2">{item.description}</p>
                                        </div>
                                        {item.image_url && (
                                            <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-gray-100 dark:border-white/5 shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-white/5">
                                        <span className="text-[10px] font-black uppercase bg-gray-50 dark:bg-slate-900/50 px-2 py-0.5 rounded text-gray-400 dark:text-slate-400">{item.category}</span>
                                        <div className="flex space-x-1">
                                            <button onClick={() => { setEditForm(item); setIsEditing(true); }} className="p-3 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-colors">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMenu(item.id)}
                                                className="p-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
