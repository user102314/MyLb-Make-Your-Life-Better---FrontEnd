// src/pages/StockList.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StockCard from '../components/StockCard';
import NavBar from '../components/Navbar.tsx'; 
import Sidebar from '../components/Sidebar.tsx'; 
import { StockData } from '../lib/types'; 

const API_STOCK_URL = "http://localhost:9090/api/stock/all"; 
const API_AUTH_CHECK_URL = "http://localhost:9090/api/client/name"; 

const StockList: React.FC = () => {
    const navigate = useNavigate();
    
    // Ajout de l'état pour le nom de l'utilisateur
    const [userName, setUserName] = useState<string | undefined>(undefined); 
    
    const [loadingAuth, setLoadingAuth] = useState(true); 
    const [loadingStocks, setLoadingStocks] = useState(false);
    
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [error, setError] = useState<string | null>(null);

    // --- LOGIQUE DE VÉRIFICATION D'AUTH ET DE FETCH DES STOCKS ---
    useEffect(() => {
        const checkAuthentication = async () => {
            setLoadingAuth(true);
            try {
                const authResponse = await fetch(API_AUTH_CHECK_URL, { credentials: 'include' });
                
                if (authResponse.status === 401) {
                    navigate('/login', { replace: true }); 
                    return; 
                }
                
                // Récupération et stockage du nom si l'authentification réussit (HTTP 200)
                if (authResponse.ok) {
                    const name = await authResponse.text();
                    setUserName(name); 
                }
                
                fetchStocks();
                
            } catch (err) {
                if (err instanceof Error) {
                    setError(`Authentication check failed: ${err.message}`);
                }
            } finally {
                setLoadingAuth(false);
            }
        };

        checkAuthentication();
    }, [navigate]);

    const fetchStocks = async () => {
        setLoadingStocks(true);
        setError(null);
        try {
            const stockResponse = await fetch(API_STOCK_URL); 
            
            if (!stockResponse.ok) {
                throw new Error(`HTTP Error: ${stockResponse.status}`);
            }
            
            const data: StockData[] = await stockResponse.json();
            setStocks(data);
            
        } catch (err) {
             if (err instanceof Error) {
                setError(`Failed to load stocks: ${err.message}`);
            }
        } finally {
            setLoadingStocks(false);
        }
    };
    
    const handleLogout = () => {
        // Redirection simple pour simuler la déconnexion et garantir la sécurité anti-retour
        navigate('/login', { replace: true });
    };
    // ----------------------------------------------------------------------

    // --- RENDER STATES (Loading/Error) ---

    if (loadingAuth) {
         return (
            <div className="bg-gray-50 min-h-screen">
                <NavBar />
                <div className="flex justify-center items-center p-10 text-xl text-indigo-600 pt-20">
                    Verifying session...
                </div>
            </div>
        );
    }
    
    if (loadingStocks || error) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <NavBar />
                {/* Passe le nom d'utilisateur même en état de chargement/erreur */}
                <Sidebar onLogout={handleLogout} userName={userName} /> 
                <div className="flex-1 p-8 ml-64 pt-16">
                    <div className={`flex justify-center items-center p-10 text-xl ${error ? 'text-red-600' : 'text-indigo-600'}`}>
                        {loadingStocks ? 'Loading stock data...' : `Error: ${error}`}
                    </div>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // RENDER MAIN LAYOUT 
    // ----------------------------------------------------------------------

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            
            {/* 1. TOP NAVBAR */}
            <NavBar /> 

            {/* 2. SIDEBAR (Bleu) - Passage du userName en prop */}
            <Sidebar onLogout={handleLogout} userName={userName} />

            {/* 3. STOCK LIST CONTENT (Rouge) */}
            <main className="flex-1 p-4 ml-64 pt-16 overflow-y-auto"> 
                
                {/* Stock List Header (Rouge) */}
                <header className="mb-8 p-4 bg-white rounded-lg shadow-lg border-l-4 border-red-500 mt-4"> 
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Global Stock Inventory ({stocks.length})
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Visualisation simplifiée des produits disponibles (deja disponible).
                    </p>
                </header>

                {/* Stock Grid (Rouge) */}
                {stocks.length === 0 ? (
                    <div className="p-10 text-center text-gray-600 border rounded-lg bg-white shadow-md">
                        No stock available at the moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {stocks.map((stock) => (
                            <StockCard key={stock.idStock} stock={stock} /> 
                        ))}
                    </div>
                )}
            </main>
            
            {/* 4. Chat with Support Bubble (Bleu) */}
            <div className="fixed bottom-4 right-4 z-50">
                 <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-600 cursor-pointer text-xs text-white">
                    Chat
                 </div>
            </div>
        </div>
    );
};

export default StockList;