import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ShoppingBag } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center bg-white">
                <Link to="/" className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition">
                    <Utensils size={28} />
                    <span className="text-2xl font-bold tracking-tight">DineDash</span>
                </Link>
                <div className="flex items-center space-x-6">
                    <Link to="/checkout" className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition">
                        <div className="relative">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="font-medium hidden sm:inline-block">Cart</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
