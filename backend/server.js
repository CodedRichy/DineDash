require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware: Simple Role Verification
const checkRole = (roles) => async (req, res, next) => {
    try {
        console.log('[AUTH] Checking role for route:', req.method, req.path);
        console.log('[AUTH] Required roles:', roles);
        
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('[AUTH] No token provided');
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            console.log('[AUTH] Invalid token:', error?.message);
            throw new Error("Unauthorized");
        }

        console.log('[AUTH] User authenticated:', user.id);

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log('[AUTH] User profile:', profile);

        if (!profile || !roles.includes(profile.role)) {
            console.log('[AUTH] Access denied. User role:', profile?.role, 'Required:', roles);
            return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
        }

        req.user = user;
        req.userRole = profile.role;
        console.log('[AUTH] Access granted for user:', user.id, 'Role:', profile.role);
        next();
    } catch (err) {
        console.log('[AUTH] Authentication failed:', err.message);
        res.status(401).json({ error: "Authentication failed" });
    }
};

// Routes
const restaurantsRoute = require('./routes/restaurants')(supabase);
const menuRoute = require('./routes/menu')(supabase, checkRole);
const ordersRoute = require('./routes/orders')(supabase, checkRole);
const usersRoute = require('./routes/users')(supabase);
const analyticsRoute = require('./routes/analytics')(supabase);

app.use('/api/restaurants', restaurantsRoute);
app.use('/api/menu', menuRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/users', checkRole(['super_admin']), usersRoute);
app.use('/api/analytics', checkRole(['super_admin']), analyticsRoute);

// Default Route
app.get('/', (req, res) => {
    res.send('DineDash API is live.');
});

// Test Route to check DB connection
app.get('/test-db', async (req, res) => {
    try {
        const { data, error } = await supabase.from('restaurants').select('*').limit(1);
        if (error) throw error;
        res.json({ message: "Connected to Supabase!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});