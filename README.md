# 🚀 DineDash

A professional, 4-sided marketplace food delivery application built with a modern full-stack architecture.

## 🏗️ Architecture & Roles
DineDash is designed with a robust Role-Based Access Control (RBAC) system:
- **🛒 Consumer**: Browse restaurants, build carts, and place orders.
- **🍱 Restaurant Manager**: Manage menu items and process incoming orders for their specific restaurant.
- **🛵 Delivery Partner (Rider)**: Claim available jobs and update delivery status.
- **👑 Super Admin**: Platform-wide oversight of all restaurants and users.

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Lucide icons.
- **Backend:** Node.js, Express.
- **Database/Auth:** Supabase (PostgreSQL, RLS Policies, Auth Service).

## 📁 Project Structure
- `backend/`: Express API server and database schema (`schema.sql`).
- `frontend/`: React application powered by Vite.
- `supabase/`: Local and remote database migrations.
- `COLLABORATION_GUIDE.md`: Essential guide for team members working on forks.

## 🚀 Setup Instructions

### 1. Database Setup (Supabase)
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run `backend/schema.sql` in the SQL Editor to initialize tables and roles.

### 2. Environment Configuration
Create a `.env` file in **both** the `frontend/` and `backend/` directories.

**Frontend (`frontend/.env`):**
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

**Backend (`backend/.env`):**
```env
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
PORT=5000
```

### 3. Installation & Running
In the root directory, run:
```bash
# Install root, backend, and frontend dependencies
npm install && cd frontend && npm install && cd ..

# Start the full application
npm run dev
```

## 🤝 Team Collaboration
If you are contributing to this project, please read the **[Collaboration Guide](./COLLABORATION_GUIDE.md)** first. It contains important instructions on forking, branching, and shared database etiquette.

### **Shared Test Accounts (Password: `password123`)**
| Account Type | Login Email |
| :--- | :--- |
| **Admin** | `admin@dinedash.app` |
| **Manager** | `manager@dinedash.app` |
| **Rider** | `rider@dinedash.app` |
| **Consumer** | `consumer@dinedash.app` |

---

## ✨ Key Features
- **Smart Navbar**: Content changes dynamically based on user role.
- **Manager Dashboard**: Private management for specific restaurant owners.
- **Rider Portal**: Dedicated interface for delivery partners to claim jobs.
- **Apple Glass Aesthetic (Optional)**: Modern design options available in components.
- **Secure Ordering**: Row Level Security (RLS) ensures users only see their own data.
