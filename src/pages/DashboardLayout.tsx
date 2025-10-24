// src/layouts/DashboardLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/Navbar'; 
const DashboardLayout: React.FC = () => {
    const userName = "John Smith";
    const handleLogout = () => { console.log("Déconnexion..."); };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex pt-16"> 
                <Sidebar userName={userName} onLogout={handleLogout} />
                
                <main className="flex-1 p-0 ml-64 overflow-y-auto bg-background"> 
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
export default DashboardLayout;
