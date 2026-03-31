# DineDash Codebase Overview

This document provides a high-level overview of the **DineDash** architecture, including backend authentication, frontend API communication, and core routing.

## 1. Backend: Server Core & Auth Middleware
The backend uses **Express** with **Supabase**. The `checkRole` middleware is the primary mechanism for Role-Based Access Control (RBAC).

```javascript
// backend/server.js (Lines 16-61)

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
```

## 2. Frontend: API Interceptor
The frontend centralizes API calls using **Axios**. It automatically injects the Supabase JWT into every request's `Authorization` header.

```javascript
// frontend/src/api/axios.js (Lines 8-21)

// REQUEST INTERCEPTOR: Auto-Inject Supabase JWT
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log('[AXIOS] Token added for user:', session.user.id);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
```

## 3. Frontend: Main Application Routing
The application manages multiple user personas (Users, Managers, Riders, and Admins) through defined routes in `App.jsx`.

```jsx
// frontend/src/App.jsx (Lines 13-32)

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/rider" element={<RiderPortal />} />
            <Route path="/restaurant/:id" element={<RestaurantMenu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderStatus />} />
            <Route path="/orders" element={<MyOrders />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
```

## 4. Backend: Modular Route Logic
Routes are separated by feature. The `menu` route illustrates how manager permissions are verified at the resource level.

```javascript
// backend/routes/menu.js (Lines 24-50)

// Create new menu item (Manager/Admin Only)
router.post('/', checkRole(['manager', 'super_admin']), async (req, res) => {
    try {
        const { restaurant_id, name, price } = req.body;

        // Safety: Managers can only add to their own restaurant
        if (req.userRole === 'manager') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('managed_restaurant_id')
                .eq('id', req.user.id)
                .single();
                
            if (profile.managed_restaurant_id !== restaurant_id) {
                return res.status(403).json({ error: "Cannot add items to other restaurants." });
            }
        }
        // ... insertion logic
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```
