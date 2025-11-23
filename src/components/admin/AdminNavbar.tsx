// src/components/admin/AdminNavbar.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Bell, UserCircle } from 'lucide-react'; // Assurez-vous d'avoir lucide-react
import { Button } from "@/components/ui/button";

interface AdminNavbarProps {
    userName: string;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ userName }) => {
    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border/50 shadow-lg z-30 transition-all duration-300">
            <div className="flex items-center justify-between h-full px-6 ml-64"> 
                
                {/* Logo et titre à gauche (décalé par la Sidebar) */}
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-primary flex items-center">
                        <Zap className="w-6 h-6 mr-2 text-indigo-400" />
                        Administration Dashboard
                    </h1>
                </div>

                {/* Profil et Notifications à droite */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Bell className="w-5 h-5" />
                    </Button>
                    
                    <div className="flex items-center space-x-2 border-l pl-4 border-border">
                         <UserCircle className="w-8 h-8 text-primary/80" />
                         <span className="text-sm font-medium text-foreground hidden sm:inline">
                             {userName}
                         </span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;