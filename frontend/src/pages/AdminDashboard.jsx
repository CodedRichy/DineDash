import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { supabase } from '../api/supabase';
import { Package, Utensils, Edit, Trash2, Plus, Clock, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRes, setSelectedRes] = useState(null);
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'

    // Auth & loading
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    // Menu form state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '', price: '', category: '', is_available: true });

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            // Check Profile Role
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!profileData || (profileData.role !== 'manager' && profileData.role !== 'super_admin')) {
                // Not an admin or manager, kick them back to home
                navigate('/');
                return;
            }

            setProfile(profileData);
            setUser(session.user);
            fetchInitialData(profileData);
        };
        checkAuth();
    }, [navigate]);

    const fetchInitialData = async (userProfile) => {
        try {
            const resData = await api.get('/restaurants');
            let list = resData.data;

            // If manager, only show their assigned restaurant
            if (userProfile?.role === 'manager' && userProfile?.managed_restaurant_id) {
                list = list.filter(r => r.id === userProfile.managed_restaurant_id);
            }

            setRestaurants(list);
            if (list.length > 0) {
                const firstRes = list[0];
                setSelectedRes(firstRes.id);
                fetchResDetails(firstRes.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResDetails = async (resId) => {
        try {
            const [ordersRes, menuRes] = await Promise.all([
                api.get(`/orders/admin/${resId}`),
                api.get(`/menu/${resId}`)
            ]);
            setOrders(ordersRes.data || []);
            setMenu(menuRes.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleResChange = (e) => {
        const newId = e.target.value;
        setSelectedRes(newId);
        fetchResDetails(newId);
    };

    const handleSaveMenu = async (e) => {
        e.preventDefault();
        try {
            if (isEditing && editForm.id) {
                await api.put(`/menu/${editForm.id}`, editForm);
            } else {
                await api.post(`/menu`, { ...editForm, restaurant_id: selectedRes });
            }
            fetchResDetails(selectedRes);
            setEditForm({ name: '', description: '', price: '', category: '', is_available: true });
            setIsEditing(false);
        } catch (err) {
            console.error("Error saving menu item", err);
            alert("Error saving item to database");
        }
    };

    const handleDeleteMenu = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/menu/${id}`);
            fetchResDetails(selectedRes);
        } catch (err) {
            console.error("Error deleting", err);
        }
    };

    const openEditForm = (item) => {
        setEditForm(item);
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setEditForm({ name: '', description: '', price: '', category: '', is_available: true });
        setIsEditing(false);
    };

    if (loading) return <div className="p-12 text-center text-lg font-bold">Loading Admin...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
                <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-sm font-bold text-gray-500 uppercase px-2">Managing ID:</span>
                    <select
                        value={selectedRes}
                        onChange={handleResChange}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-medium focus:ring-red-500 outline-none"
                    >
                        {restaurants.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'orders' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                >
                    <Package className="w-5 h-5 mr-2" /> Incoming Orders
                </button>
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`flex items-center px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'menu' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                >
                    <Utensils className="w-5 h-5 mr-2" /> Menu Management
                </button>
            </div>

            {activeTab === 'orders' && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Orders</h2>
                    {orders.length === 0 ? (
                        <p className="text-gray-500 font-medium">No orders found.</p>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order.id} className="border border-gray-100 rounded-2xl p-6 bg-gray-50 hover:bg-white transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-gray-500 text-sm flex items-center mt-1">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {new Date(order.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-sm uppercase">
                                                {order.status}
                                            </span>
                                            <p className="font-black text-xl text-green-700 mt-2">${order.total_price}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <p className="font-semibold text-gray-700 mb-2">Items:</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {order.order_items?.map(i => (
                                                <li key={i.id} className="flex justify-between">
                                                    <span>{i.quantity}x {i.menu_items?.name}</span>
                                                    <span>${(i.price_at_time_of_order * i.quantity).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'menu' && (
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 text-gray-800">
                                {isEditing ? 'Edit Item' : 'Add New Item'}
                            </h2>
                            <form onSubmit={handleSaveMenu} className="space-y-4 flex flex-col">
                                <input
                                    className="border border-gray-200 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Item Name" required
                                    value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                                <input
                                    className="border border-gray-200 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Price e.g. 12.99" type="number" step="0.01" required
                                    value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                />
                                <input
                                    className="border border-gray-200 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Category"
                                    value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                />
                                <textarea
                                    className="border border-gray-200 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Description" rows="3"
                                    value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                />
                                <label className="flex items-center space-x-2 font-medium text-gray-700">
                                    <input type="checkbox" checked={editForm.is_available} onChange={e => setEditForm({ ...editForm, is_available: e.target.checked })} className="w-5 h-5 rounded" />
                                    <span>Available on Menu</span>
                                </label>

                                <div className="flex space-x-2 mt-4">
                                    <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-colors">
                                        <Save className="w-4 h-4 mr-2" /> Save
                                    </button>
                                    {isEditing && (
                                        <button type="button" onClick={cancelEdit} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {menu.map(item => (
                                <div key={item.id} className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col ${!item.is_available ? 'opacity-60 grayscale' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                                        <span className="font-black text-green-700">${item.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 flex-grow">{item.description}</p>
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                        <span className="text-xs font-bold uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{item.category || 'General'}</span>
                                        <div className="flex space-x-2">
                                            <button onClick={() => openEditForm(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteMenu(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
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

export default AdminDashboard;
