require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Routes
const restaurantsRoute = require('./routes/restaurants')(supabase);
const menuRoute = require('./routes/menu')(supabase);
const ordersRoute = require('./routes/orders')(supabase);
const usersRoute = require('./routes/users')(supabase);

app.use('/api/restaurants', restaurantsRoute);
app.use('/api/menu', menuRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/users', usersRoute);

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