import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

const CartItem = ({ item, updateQuantity, removeItem }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm mb-3">
            <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                <p className="text-gray-500 font-medium">${Number(item.price).toFixed(2)}</p>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => updateQuantity(item.item_id, -1)}
                        className="p-1 hover:bg-gray-200 rounded-md transition text-gray-600 hover:text-red-500"
                        disabled={item.quantity <= 1}
                    >
                        <Minus size={18} />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-700">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.item_id, 1)}
                        className="p-1 hover:bg-gray-200 rounded-md transition text-gray-600 hover:text-green-500"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="w-20 text-right font-bold text-gray-800 text-lg">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                </div>

                <button
                    onClick={() => removeItem(item.item_id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};

export default CartItem;
