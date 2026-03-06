# DineDash

A full-stack food delivery application built with:
- **Backend:** Node.js, Express, Supabase (PostgreSQL)
- **Frontend:** React (Vite), Tailwind CSS

## Project Structure

- `backend/`: Contains the Express API server and Supabase database schema (`schema.sql`).
- `frontend/`: Contains the React application powered by Vite and Tailwind CSS.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Supabase Account

### 1. Database Setup
1. Create a new Supabase project.
2. In the Supabase SQL Editor, run the contents of `backend/schema.sql`.

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file and add your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   PORT=5000
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   # or node server.js
   ```

### 3. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Features
- View a list of restaurants
- Browse a restaurant's menu items
- Add items to your cart
- Place an order
- Track order status visually
