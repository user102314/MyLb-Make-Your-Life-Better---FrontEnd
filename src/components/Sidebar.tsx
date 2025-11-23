// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { 
    User, Lock, Shield, Settings, TrendingUp, Zap, CreditCard, 
    DollarSign, LogOut, MessageSquare, Briefcase, ListTodo, Sliders, 
    Building, PlusCircle
} from 'lucide-react';

// --- Sidebar Navigation Data ---
const navItems = [
    { title: "Profile Section", icon: User, links: [
        { name: "View Profile", path: "profile", icon: User },
        { name: "Modify Profile", path: "Editprofile", icon: Settings },
        { name: "Modify Password", path: "PasswordChange", icon: Lock },
        { name: "Confidentiality", path: "Confidentiality", icon: Shield },
        { name: "Verify Account", path: "verify", icon: ListTodo }
    ]},
    
    { title: "Company Section", icon: Building, links: [
        { name: "Begin Your Company Stock", path: "BeginCompanyStock", icon: PlusCircle },
        { name: "My Companies", path: "ListComponey", icon: Building },
    ]},
    
    { title: "Stocks Section", icon: Briefcase, links: [
        { name: "Available Stocks", path: "stocklist", icon: TrendingUp },
        { name: "Stocks Market", path: "market", icon: Sliders },
        { name: "Best Selling Stocks", path: "/stocklist/bestselling", icon: Zap },
        { name: "Recommended Stocks", path: "/stocklist/recommended", icon: DollarSign },
    ]},
    { title: "Management Section", icon: CreditCard, links: [
        { name: "View Wallet", path: "wallet", icon: CreditCard },
        { name: "View Transactions", path: "Transactions", icon: DollarSign },
        { name: "Statistique Sold", path: "statistique", icon: DollarSign },
        { name: "View Card Detail", path: "cards", icon: CreditCard },
        { name: "View Stocks Wallet", path: "StockWallet", icon: Briefcase },
        { name: "Chat with Support", path: "support", icon: MessageSquare }, // ✅ CORRIGÉ : "support" au lieu de "/support"
    ]},
];

interface SidebarProps {
    userName: string; 
    onLogout: () => void; 
}

const Sidebar: React.FC<SidebarProps> = ({ userName, onLogout }) => {
    const location = useLocation();

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        onLogout(); 
    };

    const displayUserName = userName; 

    return (
        <aside className="w-64 bg-card/90 border-r border-border h-[calc(100vh-4rem)] flex flex-col flex-shrink-0 shadow-2xl fixed left-0 top-16 z-30 backdrop-blur-md">
            
            {/* Section du Nom d'Utilisateur (Profil) - FIXE */}
            <div className="p-4 border-b border-border/50 bg-card/95 flex-shrink-0">
                <div className="text-xl font-bold text-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-cyan-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                        
                        <span className="flex-grow min-w-0">
                            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent font-extrabold truncate block">
                                {displayUserName}
                            </span>
                            <span className="text-xs text-muted-foreground font-light block">
                                Espace Personnel
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Links - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 space-y-6">
                    {navItems.map((section, index) => {
                        const SectionIcon = section.icon;
                        return (
                            <div key={index} className="mb-6">
                                <h3 className="text-xs uppercase font-bold text-primary flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                                    <SectionIcon className="w-4 h-4" />
                                    {section.title}
                                </h3>
                                <ul className="space-y-1">
                                    {section.links.map((link, linkIndex) => {
                                        const LinkIcon = link.icon;
                                        const isActive = location.pathname.includes(link.path);
                                        
                                        return (
                                            <li key={linkIndex}>
                                                <Link 
                                                    to={link.path.startsWith('/') ? link.path : link.path} 
                                                    className={`
                                                        block text-sm py-2 px-3 rounded-lg font-medium transition-all duration-200
                                                        ${isActive 
                                                            ? 'text-foreground bg-primary/10 border-l-4 border-primary shadow-inner shadow-primary/20' 
                                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <LinkIcon className="w-4 h-4" />
                                                        {link.name}
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pied de Sidebar (Support et Déconnexion) - FIXE */}
            <div className="p-4 border-t border-border space-y-2 bg-card/95 flex-shrink-0">
                <Link 
                    to="support" // ✅ CORRIGÉ : "support" au lieu de "/support"
                    className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                    <MessageSquare className="w-4 h-4" />
                    Chat with Support
                </Link>
                <a 
                    href="#" 
                    onClick={handleLogout} 
                    className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;