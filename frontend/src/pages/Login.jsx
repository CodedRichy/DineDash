import React, { useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage('Signup successful! Please check your email for verification.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/');
            }
        } catch (err) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {message && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {message}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-red-600/30"
                >
                    {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                </button>
            </form>
            <p className="mt-8 text-center text-gray-600 font-medium">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-red-500 hover:text-red-600 font-bold ml-1"
                >
                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
            </p>
        </div>
    );
};

export default Login;
