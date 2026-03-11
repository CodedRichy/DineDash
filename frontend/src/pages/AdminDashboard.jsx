import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { supabase } from '../api/supabase';
import { Package, Utensils, Users, Edit, Trash2, Shield, Store, Check, X, AlertCircle, Search, BarChart3, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#06b6d4', '#4f46e5', '#10b981'];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'orders', 'menu', or 'logs'
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    // Analytics State
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // User & Search State
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [logs, setLogs] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    // Legacy State (Orders/Menu)
    const [selectedRes, setSelectedRes] = useState(null);
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
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
                fetchInitialData();
            } catch (err) {
                console.error("Auth check failed", err);
                setError("Authentication failed. Please refresh.");
                setLoading(false);
            }
        };
        checkAuth();
    }, [navigate]);

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchUsers('').catch(e => { console.error(e); return []; }),
                fetchLogs().catch(e => { console.error(e); return []; }),
                fetchRestaurants().catch(e => { console.error(e); return []; }),
                fetchStats().catch(e => { console.error(e); setError("Analytics load failed."); return null; })
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (query = '') => {
        try {
            const res = await api.get(`/users?search=${query}`);
            setUsers(res.data || []);
        } catch (err) {
            console.error("Error fetching users", err);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get('/users/logs');
            setLogs(res.data || []);
        } catch (err) {
            console.error("Error fetching logs", err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/analytics/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching stats", err);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const res = await api.get('/restaurants');
            setRestaurants(res.data || []);
            if (res.data.length > 0) {
                setSelectedRes(res.data[0].id);
                fetchResDetails(res.data[0].id);
            }
        } catch (err) {
            console.error("Error fetching restaurants", err);
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
            await api.put(`/users/${userId}`, updates, {
                headers: { 'x-admin-id': profile.id }
            });
            await fetchUsers(search);
            await fetchLogs();
            await fetchStats(); // Refresh stats too in case of role shifts
            setEditingUser(null);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update user");
        }
    };

    const onSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        fetchUsers(val);
    };

    const handleDeleteMenu = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this menu item?")) return;
        try {
            await api.delete(`/menu/${itemId}`);
            setMenu(prev => prev.filter(item => item.id !== itemId));
            // Also refresh global stats if necessary
            fetchStats();
        } catch (err) {
            alert("Something went wrong. Please try again.");
            console.error(err);
        }
    };

    if (loading) return <div className="p-12 text-center text-lg font-bold">Loading Platform Admin...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Platform Control</h1>
                <p className="text-gray-500 dark:text-slate-400 font-medium">Global oversight and user permissions management.</p>
            </header>

            <div className="flex space-x-2 mb-8 bg-gray-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                >
                    <BarChart3 className="w-5 h-5 mr-2" /> Overview
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                >
                    <Users className="w-5 h-5 mr-2" /> Users
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                >
                    <Package className="w-5 h-5 mr-2" /> Orders
                </button>
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'menu' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                >
                    <Utensils className="w-5 h-5 mr-2" /> Menus
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'logs' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                >
                    <Shield className="w-5 h-5 mr-2" /> Audit Logs
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            {activeTab === 'overview' && (
                !stats ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-20 text-center border-2 border-dashed border-gray-100 dark:border-white/5">
                        <BarChart3 className="w-16 h-16 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">Analytics are currently unavailable</h3>
                        <p className="text-gray-400 mt-2">There might be a connection issue or no data to display.</p>
                        <button onClick={fetchInitialData} className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : (

                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
                                <span className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-400">Total Revenue</span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">${stats.orders.revenue}</h3>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-400 mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Platform Lifetime</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 rounded-2xl"><ShoppingBag className="w-6 h-6" /></div>
                                <span className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-400">Total Orders</span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.orders.total}</h3>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-400 mt-1">{stats.orders.pending} pending fulfillment</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400 rounded-2xl"><Store className="w-6 h-6" /></div>
                                <span className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-400">Active Stores</span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.restaurants}</h3>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-400 mt-1">Marketplace partners</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 rounded-2xl"><Users className="w-6 h-6" /></div>
                                <span className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-400">User Growth</span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{Object.values(stats.users).reduce((a, b) => a + b, 0)}</h3>
                            <div className="flex space-x-2 mt-1">
                                {Object.entries(stats.users).map(([role, count]) => (
                                    <span key={role} className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-slate-300 rounded">
                                        {role[0]}: {count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="text-xl font-bold mb-8 text-gray-800 dark:text-white flex items-center">
                                <TrendingUp className="w-5 h-5 mr-3 text-red-500" /> Platform Revenue (Last 7 Days)
                            </h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.orders.dailyRevenue}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}
                                            dx={-10}
                                            tickFormatter={(val) => `$${val}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#ef4444"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorRev)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="text-xl font-bold mb-8 text-gray-800 dark:text-white flex items-center">
                                <Package className="w-5 h-5 mr-3 text-blue-500" /> Order Fulfillment
                            </h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.orders.statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.orders.statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend
                                            verticalAlign="bottom"
                                            align="center"
                                            iconType="circle"
                                            wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
                )
            )}

            {activeTab === 'users' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center px-8">
                        <Search className="w-5 h-5 text-gray-400 mr-4" />
                        <input
                            type="text"
                            placeholder="Search by email or role..."
                            className="bg-transparent border-0 outline-none w-full font-bold text-gray-700 dark:text-white dark:placeholder-slate-400"
                            value={search}
                            onChange={onSearchChange}
                        />
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                    <th className="px-8 py-5 text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-left">User Email</th>
                                    <th className="px-8 py-5 text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-5 text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Assignment</th>
                                    <th className="px-8 py-5 text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-medium whitespace-nowrap">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                )}
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white">{u.email || 'No Email Found'}</span>
                                                <span className="font-mono text-[10px] text-gray-400 uppercase tracking-tighter">{u.id.slice(0, 8)}...</span>
                                                {u.id === profile?.id && <span className="w-fit mt-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-tighter">You (Super Admin)</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                {u.role === 'super_admin' ? (
                                                    <span className="flex items-center bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 font-black px-3 py-1 rounded-lg text-xs uppercase">
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
                                                    <span className={`font-black px-3 py-1 rounded-lg text-xs uppercase border border-transparent ${u.role === 'manager' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400' :
                                                        u.role === 'delivery_partner' ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
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
                                                        onClick={() => { setEditingUser(null); fetchUsers(search); }}
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
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                <th className="px-8 py-5 text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Time</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Action</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Target Email</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.map(log => (
                                <tr key={log.id} className="text-sm">
                                    <td className="px-8 py-4 text-gray-400 font-medium">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${log.action_type === 'ROLE_CHANGE' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {log.action_type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 font-bold text-gray-700 dark:text-white">{log.profiles?.email || 'System'}</td>
                                    <td className="px-8 py-4 font-mono text-[11px] text-gray-400 max-w-xs truncate">
                                        {JSON.stringify(log.details)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(activeTab === 'orders' || activeTab === 'menu') && (
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between">
                        <div className="flex items-center">
                            <Store className="w-5 h-5 mr-3 text-red-500" />
                            <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter mr-4">Previewing Restaurant:</span>
                            <select
                                value={selectedRes}
                                onChange={(e) => { setSelectedRes(e.target.value); fetchResDetails(e.target.value); }}
                                className="bg-gray-100 dark:bg-slate-900 dark:text-white border-0 rounded-xl px-4 py-2 font-bold focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-xs font-black text-gray-400 bg-gray-50 dark:bg-slate-900 px-4 py-2 rounded-full uppercase">
                            Global Catalog Mode
                        </div>
                    </div>

                    {activeTab === 'orders' && (
                        <div className="grid gap-4">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm flex justify-between items-center group hover:border-red-100 dark:hover:border-red-900 transition-colors">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center font-black text-gray-400 dark:text-slate-500 group-hover:bg-red-50 dark:group-hover:bg-red-900/30 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                            #{order.id.slice(0, 4)}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 dark:text-white">${order.total_price}</p>
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
                                <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-black text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="font-black text-green-600">${item.price}</p>
                                    </div>
                                    <p className="text-sm text-gray-400 dark:text-slate-300 font-medium mb-4 line-clamp-2">{item.description}</p>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-white/5">
                                        <span className="text-[10px] font-black uppercase bg-gray-50 dark:bg-slate-900/50 px-2 py-0.5 rounded text-gray-400 dark:text-slate-400">{item.category}</span>
                                        <button
                                            onClick={() => handleDeleteMenu(item.id)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
