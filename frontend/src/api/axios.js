import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// REQUEST INTERCEPTOR: Auto-Inject Supabase JWT
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// RESPONSE INTERCEPTOR: Global Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized (Expired Session)
            if (error.response.status === 401) {
                console.error('Session expired. Redirecting to login...');
                supabase.auth.signOut().then(() => {
                    window.location.href = '/login';
                });
            }
            // Handle 500 Internal Server Error
            else if (error.response.status >= 500) {
                console.error('Server error. Please try again later.');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
