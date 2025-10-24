// src/components/Sidebar.tsx

import React from 'react';
import { Link } from 'react-router-dom';

// --- Sidebar Navigation Data (Translated to English) ---
const navItems = [
    { title: "Profile Section", links: [
        { name: "View Profile", path: "profile" },
        { name: "Modify Profile", path: "/profile/edit" },
        { name: "Modify Password", path: "/profile/password" },
        { name: "Confidentiality", path: "/profile/privacy" },
        { name: "Verfify", path: "verify" }
    ]},
    { title: "Stocks Section", links: [
        { name: "Available Stocks", path: "/stocklist" },
        { name: "Unavailable Stocks", path: "/stocklist/unavailable" },
        { name: "Best Selling Stocks", path: "/stocklist/bestselling" },
        { name: "Recommended Stocks", path: "/stocklist/recommended" },
    ]},
    { title: "Management Section", links: [
        { name: "View Wallet", path: "/wallet" },
        { name: "Deposit", path: "/wallet/deposit" },
        { name: "Withdraw", path: "/wallet/withdraw" },
        { name: "View Card Detail", path: "/wallet/card" },
        { name: "View Stocks Wallet", path: "/wallet/stocks" },
    ]},
];
// --------------------------------------------------------

interface SidebarProps {
    // Le nom d'utilisateur est maintenant une prop
    userName: string | undefined; 
    onLogout: () => void; 
}

const Sidebar: React.FC<SidebarProps> = ({ userName, onLogout }) => {
    
    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        onLogout(); 
    };

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col justify-between flex-shrink-0 shadow-xl fixed left-0 top-16 z-30 backdrop-blur-sm">
            <div className="p-4 overflow-y-auto">
                
                {/* Affiche le nom de l'utilisateur ou un texte par défaut */}
                <div className="text-xl font-bold text-foreground mb-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary-glow rounded-full"></div>
                        <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                            {userName || "MR user..."}
                        </span>
                    </div>
                </div>

                {navItems.map((section, index) => (
                    <div key={index} className="mb-6">
                        <h3 className="text-xs uppercase font-semibold text-primary mb-3 pb-2 border-b border-border/50">
                            {section.title}
                        </h3>
                        <ul className="space-y-1">
                            {section.links.map((link, linkIndex) => (
                                <li key={linkIndex}>
                                    <Link 
                                        to={link.path}
                                        className="block text-sm py-2 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-border space-y-2">
                <Link 
                    to="/support" 
                    className="block text-sm py-2 px-3 rounded-lg font-medium text-primary hover:bg-primary/10 transition-smooth"
                >
                    Chat with Support
                </Link>
                <a 
                    href="#" 
                    onClick={handleLogout} 
                                        className="block text-sm py-2 px-3 rounded-lg font-medium text-destructive hover:bg-destructive/10 transition-smooth"

                >
                    Logout
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;