require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware: Simple Role Verification
const checkRole = (roles) => async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "No token provided" });

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw new Error("Unauthorized");

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !roles.includes(profile.role)) {
            return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
        }

        req.user = user;
        req.userRole = profile.role;
        next();
    } catch (err) {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});