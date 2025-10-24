// src/pages/StockList.tsx

import React, { useState, useEffect } from 'react';
import StockCard from '../components/StockCard';
import NavBar from '../components/Navbar.tsx'; // ⬅️ IMPORT
import { StockData } from '../lib/types'; // Make sure the path is correct

const API_URL = "http://localhost:9090/api/stock/all"; 

const StockList: React.FC = () => {
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ----------------------------------------------------------------------
    // Fetch Logic (Data Retrieval)
    // ----------------------------------------------------------------------
    useEffect(() => {
        const fetchStocks = async () => {
            try {
                // Ensure credentials: 'include' is used if the API requires authentication
                const response = await fetch(API_URL, { credentials: 'include' }); 
                
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                
                const data: StockData[] = await response.json();
                setStocks(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(`Failed to load stocks: ${err.message}`);
                } else {
                    setError("An unknown error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, []);

    // ----------------------------------------------------------------------
    // Loading and Error Render
    // ----------------------------------------------------------------------

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <NavBar />
                <div className="flex justify-center items-center p-10 text-xl text-indigo-600">
                    Loading stocks...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <NavBar />
                <div className="p-10 max-w-7xl mx-auto text-red-700 bg-red-100 rounded-lg mt-8 border border-red-300">
                    Connection Error: {error}
                </div>
            </div>
        );
    }
    
    // ----------------------------------------------------------------------
    // Stock List Render
    // ----------------------------------------------------------------------

    return (
        <div className="bg-gray-50 min-h-screen">
            
            {/* 1. Navigation Bar (Handles Username Display) */}
            <NavBar /> 

            {/* 2. Main Page Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Page Header */}
                <header className="mb-8 p-4 bg-white rounded-lg shadow-lg border-l-4 border-indigo-500 mt-10"> 
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Global Stock Inventory ({stocks.length})
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Simplified visualization of available products. 
                        Click on "Details" for more information.
                    </p>
                </header>

                {stocks.length === 0 ? (
                    <div className="p-10 text-center text-gray-600 border rounded-lg bg-white shadow-md">
                        No stock available at the moment.
                    </div>
                ) : (
                    // Stock Card Grid Display
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {stocks.map((stock) => (
                            <StockCard key={stock.idStock} stock={stock} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockList;