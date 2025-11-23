// src/layouts/DashboardLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/Navbar'; 

const useAuthContextPlaceholder = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("John Smith"); 
    const [isAuthenticated, setIsAuthenticated] = useState(true); 
    const [loadingAuth, setLoadingAuth] = useState(false);

    const logout = () => {
        setIsAuthenticated(false);
        setUserName(undefined);
        navigate('/login', { replace: true });
    };
    
    useEffect(() => {

    }, []); 

    return { userName, isAuthenticated, loadingAuth, logout };
};


const DashboardLayout: React.FC = () => {
    const { userName, isAuthenticated, loadingAuth, logout } = useAuthContextPlaceholder(); 

    if (loadingAuth) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-primary text-2xl">Chargement du Tableau de Bord...</div>;
    }
    if (!isAuthenticated) {
        return null; 
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar /> 
            <div className="flex"> 
                <Sidebar userName={userName} onLogout={logout} />
                <main className="flex-1 ml-64 pt-16 p-6 overflow-y-auto min-h-screen"> 
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;