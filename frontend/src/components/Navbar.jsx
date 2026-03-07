import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, ShoppingBag, User, LogOut, Sun, Moon } from 'lucide-react';
import { supabase } from '../api/supabase';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        const fetchProfile = async (u) => {
            if (!u) return setProfile(null);
            const { data } = await supabase.from('profiles').select('*').eq('id', u.id).single();
            setProfile(data);
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
            if (session?.user) fetchProfile(session.user);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user || null;
            setUser(currentUser);
            fetchProfile(currentUser);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const isAdmin = profile?.role === 'super_admin';
    const isManager = profile?.role === 'manager';
    const isDelivery = profile?.role === 'delivery_partner';

    const toggleTheme = () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    return (
        <nav className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 transition-colors duration-200 border-b border-transparent dark:border-slate-800">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center bg-white dark:bg-slate-900 transition-colors duration-200">
                <Link to="/" className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition">
                    <Utensils size={28} />
                    <span className="text-2xl font-bold tracking-tight">DineDash</span>
                </Link>
                <div className="flex items-center space-x-6">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition-colors duration-200"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    {!isAdmin && !isManager && !isDelivery && (
                        <Link to="/checkout" className="flex items-center space-x-1 text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition font-medium">
                            <ShoppingBag size={24} />
                            <span className="hidden sm:inline-block">Cart</span>
                        </Link>
                    )}

                    {user ? (
                        <>
                            {isAdmin && (
                                <Link to="/admin" className="text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition font-medium">Platform Admin</Link>
                            )}
                            {isManager && (
                                <Link to="/manager" className="text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition font-medium">My Restaurant</Link>
                            )}
                            {isDelivery && (
                                <Link to="/rider" className="text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition font-medium">Rider Portal</Link>
                            )}
                            <button onClick={handleLogout} className="flex items-center space-x-1 text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition font-medium">
                                <LogOut size={22} />
                                <span className="hidden sm:inline-block">Logout</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition font-bold shadow-sm">
                            <User size={18} />
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
