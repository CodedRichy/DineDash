import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { supabase } from '../api/supabase';
import { Package, Utensils, Users, Edit, Trash2, Shield, Store, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'orders', or 'menu'
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    // User Management State
    const [users, setUsers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    // Legacy State (Orders/Menu)
    const [selectedRes, setSelectedRes] = useState(null);
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);

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

            if (!profileData || profileData.role !== 'super_admin') {
                navigate('/');
                return;
            }

            setProfile(profileData);
            fetchData();
        };
        checkAuth();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [usersRes, resData] = await Promise.all([
                api.get('/users'),
                api.get('/restaurants')
            ]);
            setUsers(usersRes.data);
            setRestaurants(resData.data);

            if (resData.data.length > 0) {
                setSelectedRes(resData.data[0].id);
                fetchResDetails(resData.data[0].id);
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

    const handleUpdateUser = async (userId, updates) => {
        try {
            await api.put(`/users/${userId}`, updates);
            // Refresh local state
            setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
            setEditingUser(null);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update user");
        }
    };

    if (loading) return <div className="p-12 text-center text-lg font-bold">Loading Platform Admin...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 mb-2">Platform Control</h1>
                <p className="text-gray-500 font-medium">Global oversight and user permissions management.</p>
            </header>

            <div className="flex space-x-2 mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Users className="w-5 h-5 mr-2" /> Users
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Package className="w-5 h-5 mr-2" /> Orders
                </button>
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'menu' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Utensils className="w-5 h-5 mr-2" /> Menus
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-widest text-left">User Email</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">Assignment</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{u.email || 'No Email Found'}</span>
                                            <span className="font-mono text-[10px] text-gray-400 uppercase tracking-tighter">{u.id.slice(0, 8)}...</span>
                                            {u.id === profile?.id && <span className="w-fit mt-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-tighter">You (Super Admin)</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center">
                                            {u.role === 'super_admin' ? (
                                                <span className="flex items-center bg-purple-100 text-purple-700 font-black px-3 py-1 rounded-lg text-xs uppercase">
                                                    <Shield className="w-3 h-3 mr-1.5" /> Super Admin
                                                </span>
                                            ) : editingUser === u.id ? (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => setUsers(users.map(item => item.id === u.id ? { ...item, role: e.target.value } : item))}
                                                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="consumer">Consumer</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="delivery_partner">Rider</option>
                                                </select>
                                            ) : (
                                                <span className={`font-black px-3 py-1 rounded-lg text-xs uppercase ${u.role === 'manager' ? 'bg-orange-100 text-orange-600' :
                                                    u.role === 'delivery_partner' ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {u.role === 'manager' ? (
                                            editingUser === u.id ? (
                                                <select
                                                    value={u.managed_restaurant_id || ''}
                                                    onChange={(e) => setUsers(users.map(item => item.id === u.id ? { ...item, managed_restaurant_id: e.target.value || null } : item))}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="">No Store assigned</option>
                                                    {restaurants.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="flex items-center text-sm font-bold text-gray-700">
                                                    <Store className="w-4 h-4 mr-2 text-gray-400" />
                                                    {restaurants.find(r => r.id === u.managed_restaurant_id)?.name || "Unassigned"}
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-gray-300 italic text-sm">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {u.role === 'super_admin' ? (
                                            u.id === profile?.id ? (
                                                <div className="flex items-center justify-end text-orange-400 text-xs font-bold italic">
                                                    <AlertCircle className="w-3 h-3 mr-1" /> SQL Protected
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs font-bold uppercase">Immutable</span>
                                            )
                                        ) : editingUser === u.id ? (
                                            <div className="flex space-x-2 justify-end">
                                                <button
                                                    onClick={() => handleUpdateUser(u.id, { role: u.role, managed_restaurant_id: u.managed_restaurant_id })}
                                                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setEditingUser(null); fetchData(); }}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingUser(u.id)}
                                                className="text-blue-600 hover:text-blue-700 font-black text-xs uppercase tracking-tighter"
                                            >
                                                Edit Permissions
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(activeTab === 'orders' || activeTab === 'menu') && (
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center">
                            <Store className="w-5 h-5 mr-3 text-red-500" />
                            <span className="font-black text-gray-900 uppercase tracking-tighter mr-4">Previewing Restaurant:</span>
                            <select
                                value={selectedRes}
                                onChange={(e) => { setSelectedRes(e.target.value); fetchResDetails(e.target.value); }}
                                className="bg-gray-100 border-0 rounded-xl px-4 py-2 font-bold focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-xs font-black text-gray-400 bg-gray-50 px-4 py-2 rounded-full uppercase">
                            Global Catalog Mode
                        </div>
                    </div>

                    {activeTab === 'orders' && (
                        <div className="grid gap-4">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex justify-between items-center group hover:border-red-100 transition-colors">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                            #{order.id.slice(0, 4)}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900">${order.total_price}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase">{order.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-gray-300">Ordered {new Date(order.created_at).toLocaleTimeString()}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'menu' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menu.map(item => (
                                <div key={item.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-black text-gray-900">{item.name}</p>
                                        <p className="font-black text-green-600">${item.price}</p>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium mb-4 line-clamp-2">{item.description}</p>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                        <span className="text-[10px] font-black uppercase bg-gray-50 px-2 py-0.5 rounded text-gray-400">{item.category}</span>
                                        <button className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
