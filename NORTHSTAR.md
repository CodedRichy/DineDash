# 🌟 DineDash Northstar Document

Welcome to the **DineDash Northstar Document**. This document serves as the foundational source of truth for the DineDash project. It is designed to rapidly onboard new developers, AI agents, and product managers by providing a comprehensive overview of the architecture, tech stack, data models, and business logic.

---

## 📖 1. Project Overview

**DineDash** is a professional, 4-sided marketplace application for food delivery. It connects hungry consumers with local restaurants, empowers restaurant managers to control their digital storefronts, provides delivery partners (riders) with a platform to earn by fulfilling orders, and gives super admins platform-wide oversight.

### The 4 Pillars (Role-Based Access Control)
1. **🛒 Consumer**: The end-user who browses restaurants, adds items to their cart, places orders, and tracks delivery status.
2. **🍱 Restaurant Manager**: The merchant who manages their restaurant's profile, updates menu items, and processes incoming orders.
3. **🛵 Delivery Partner (Rider)**: The courier who claims available delivery jobs, picks up food from the restaurant, and updates the status upon delivery.
4. **👑 Super Admin**: The platform owner who oversees all operations, manages restaurants, monitors platform analytics, and handles user access.

---

## 🏗️ 2. High-Level Architecture

DineDash operates on a modern, decoupled full-stack architecture:

- **Frontend Application (SPA)**: Built with React and Vite. It serves as the UI layer for all four roles, intelligently rendering different views based on the authenticated user's role.
- **Backend API (RESTful)**: A Node.js and Express server that handles business logic, role verification, and acts as a secure proxy to the database for complex operations.
- **Database & Auth (BaaS)**: Supabase provides PostgreSQL for persistence, built-in GoTrue authentication, and Row Level Security (RLS) to ensure users can only access data permitted by their role.

---

## 🛠️ 3. Technology Stack

### Frontend (Client)
- **Framework**: [React 19](https://react.dev/) powered by [Vite 7](https://vitejs.dev/) for lightning-fast HMR and building.
- **Routing**: `react-router-dom` (Client-side routing).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) for utility-first styling. Includes dynamic light/dark mode toggling (implemented via the View Transitions API for smooth circular wipe animations).
- **Icons**: `lucide-react`.
- **Data Visualization**: `recharts` for charting and analytics (Super Admin dashboard).
- **State Management**: React Hooks (`useState`, `useEffect`) and Context (where applicable).

### Backend (Server)
- **Environment**: Node.js.
- **Web Framework**: Express v5.
- **Deployment Adapter**: `serverless-http` (prepared for deployment to environments like Netlify Functions or AWS Lambda).
- **Middleware**: `cors` for cross-origin resource sharing, built-in Express JSON body parsing.

### Data Layer & Auth
- **Provider**: [Supabase](https://supabase.com/).
- **Database**: PostgreSQL.
- **Authentication**: JWT-based session management (`@supabase/supabase-js`).
- **Security**: PostgreSQL Row Level Security (RLS) policies defined in `schema.sql`.

---

## 📂 4. Project Structure

The repository is structured as a monorepo containing both the frontend and backend.

```
DineDash/
├── backend/                  # Express API Server
│   ├── routes/               # Modular Express Route Handlers
│   │   ├── analytics.js      # Platform-wide metrics
│   │   ├── menu.js           # Menu CRUD operations
│   │   ├── orders.js         # Order placement and tracking
│   │   ├── restaurants.js    # Restaurant CRUD and listing
│   │   └── users.js          # User management queries
│   ├── server.js             # Main Express application entry point
│   ├── schema.sql            # Core database schema and RLS definitions
│   └── package.json          # Backend dependencies
├── frontend/                 # React Application
│   ├── src/
│   │   ├── api/              # Supabase client config and API calls
│   │   ├── components/       # Reusable UI components (Navbar, RestaurantCard, etc.)
│   │   ├── pages/            # Top-level route components (Home, ManagerDashboard, etc.)
│   │   ├── App.jsx           # Main router configuration
│   │   ├── main.jsx          # React DOM mounting
│   │   └── index.css         # Global styles and Tailwind imports
│   ├── index.html            # Vite HTML template
│   ├── vite.config.js        # Vite build configuration
│   └── package.json          # Frontend dependencies
├── netlify/                  # Deployment configuration (if applicable)
├── supabase/                 # Local Supabase configuration (if applicable)
├── package.json              # Root package descriptor (for concurrent scripts)
├── README.md                 # Quick start guide
└── NORTHSTAR.md              # This document
```

---

## 🔒 5. Security & Authentication Flow

1. **Login/Registration**: Handled directly from the frontend via the Supabase Client (`supabase.auth.signInWithPassword`).
2. **Session Persistence**: JWT tokens are automatically managed and securely stored in the browser by the Supabase client.
3. **Role Verification (Backend)**: When the frontend makes requests to the Express backend, it attaches the `Authorization: Bearer <token>` header.
4. **Middleware (`checkRole`)**: The Express server intercepts the request, verifies the token against Supabase (`supabase.auth.getUser`), fetches the user's role from the `profiles` table, and ensures they have the correct permissions before executing the route handler.

---

## 🚀 6. Core Workflows & Logic

### Submitting an Order (Consumer)
1. Consumer browses a restaurant (`RestaurantMenu.jsx`) and adds items to the local React state (Cart).
2. On checkout, a request is sent to the backend `POST /api/orders`.
3. The backend validates the payload, calculates the total (or trusts the validated client calculation depending on implementation), and inserts a record into the `orders` table. Order items are inserted into a relational `order_items` table.
4. The backend returns the `order_id` so the consumer can track the status.

### Fulfilling an Order (Manager & Rider)
1. **Manager**: Sees new orders grouped by status (`Pending`, `Preparing`, `Ready`). They move the order from "Pending" to "Preparing", and finally to "Ready for Pickup".
2. **Rider**: The `RiderPortal.jsx` fetches orders with the status `Ready for Pickup`. The rider "claims" the order, updating the status to `Out for Delivery` and assigning their `rider_id`.
3. **Delivery**: Once delivered, the rider marks it as `Delivered`.

---

## 💅 7. UI/UX Design Principles

- **Responsive Design**: Mobile-first Tailwind utility classes (`sm:`, `md:`, `lg:`).
- **Theming**: Centralized Dark/Light mode toggle located in `Navbar.jsx`. State is persisted in `localStorage`.
- **Visual Feedback**: Hover states, smooth transitions, and conditional rendering based on authentication state provide a dynamic and responsive user experience.
- **Glassmorphism (Optional but Supported)**: Implementation of translucent/blur backgrounds (e.g., `backdrop-blur-md bg-white/50`) for premium aesthetics.

---

## 🤖 8. AI Agent Instructions

If you are an AI reading this document to assist with the codebase:
- **Routing**: `react-router-dom` v7 is used. Be mindful of object-based routing or standard JSX routes in `App.jsx`.
- **Styling**: **Always** use Tailwind V4 utility classes instead of writing custom CSS in `index.css` unless defining base variables or keyframes.
- **Backend Changes**: Whenever a new API route is created, ensure that the `checkRole` middleware is applied appropriately to secure endpoints.
- **Database**: The source of truth for the database schema is `backend/schema.sql`. Refer to this for joining tables or understanding foreign key relationships.

---

*This document is a living artifact. Please update it iteratively as the architecture or primary workflows of DineDash evolve.*
