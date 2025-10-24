// src/components/StockCard.tsx

import React from 'react';
import { StockData } from '../lib/types'; // Assurez-vous du chemin correct

interface StockCardProps {
    stock: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
    // Calcul de l'état du stock
    const stockRatio = (stock.stockReste / stock.stockDisponible) * 100;
    const isLow = stockRatio < 20;

    return (
        <div 
            className={`
                bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-[1.03] 
                ${isLow ? 'border-l-4 border-red-500' : 'border-l-4 border-green-400'}
            `}
            style={{ minWidth: '300px' }}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800 truncate">{stock.nomStock}</h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full 
                    ${isLow ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
                `}>
                    {isLow ? 'Épuisement' : 'En Stock'}
                </span>
            </div>

            {/* Jauge de Stock Restant (Innovant) */}
            <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Stock Restant ({stock.stockReste} / {stock.stockDisponible})</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className={`h-2.5 rounded-full ${isLow ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${stockRatio}%` }}
                    ></div>
                </div>
            </div>

            {/* Prix */}
            <div className="flex items-center justify-between border-t pt-4">
                <div className="text-2xl font-extrabold text-indigo-600">
                    {stock.prixStock.toFixed(2)} DH
                </div>
                <button className="bg-indigo-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-indigo-600 transition">
                    Détails
                </button>
            </div>
        </div>
    );
};

export default StockCard;