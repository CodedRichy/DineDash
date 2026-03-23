import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// REQUEST INTERCEPTOR: Auto-Inject Supabase JWT
api.interceptors.request.use(async (config) => {
    console.log('[AXIOS] Request:', config.method?.toUpperCase(), config.url);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log('[AXIOS] Token added for user:', session.user.id);
    } else {
        console.log('[AXIOS] No session found');
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// RESPONSE INTERCEPTOR: Global Error Handling
api.interceptors.response.use(
    (response) => {
        console.log('[AXIOS] Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        if (error.response) {
            console.log('[AXIOS] Error response:', error.response.status, error.config?.url);
            // Handle 401 Unauthorized (Expired Session)
            if (error.response.status === 401) {
                console.error('Session expired. Redirecting to login...');
                supabase.auth.signOut()
                    .catch(err => console.error('Sign out failed:', err))
                    .finally(() => {
                        window.location.href = '/login';
                    });
            }
            // Handle 500 Internal Server Error
            else if (error.response.status >= 500) {
                console.error('Server error. Please try again later.');
            }
        } else {
            console.log('[AXIOS] Network error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
