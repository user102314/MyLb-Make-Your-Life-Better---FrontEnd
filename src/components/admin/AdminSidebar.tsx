// src/components/admin/AdminSidebar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// J'importe de nouvelles icônes pour la clarté de la navigation
import { LogOut, User, DollarSign, Settings, Shield, Zap, List, Landmark, FileText, CheckCircle, Fingerprint } from 'lucide-react'; 

interface AdminSidebarProps {
    userName: string;
    onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ userName, onLogout }) => {
    const location = useLocation();

    // 🔑 NOUVELLE STRUCTURE DE NAVIGATION
    const sections = [
        {
            title: "VUES GÉNÉRALES",
            items: [
                { path: "/admin/dashboard", icon: Zap, label: "Vue Générale" },
                { path: "/admin/all-users", icon: User, label: "Voir tous les Utilisateurs" },
                { path: "/admin/all-companies", icon: Landmark, label: "Voir toutes les Sociétés" },
                { path: "/admin/all-stocks", icon: List, label: "Voir toutes les Actions" },
                { path: "/admin/all-reports", icon: FileText, label: "Voir tous les Rapports" },
            ]
        },
        {
            title: "APPLICATIONS (VALIDATION)",
            items: [
                // Ceci est la page que nous allons développer
                { path: "/admin/company-application", icon: CheckCircle, label: "Validation Sociétés" }, 
                { path: "/admin/identity-application", icon: Fingerprint, label: "Validation Identité" },
                // ... autres validations
            ]
        },
    ];

    const getLinkClass = (path: string) => 
        `flex items-center space-x-3 p-3 rounded-xl transition-colors duration-200 ${
            location.pathname.startsWith(path) && path !== "/admin/dashboard" 
                ? 'bg-primary/20 text-primary font-semibold'
                : location.pathname === path 
                ? 'bg-primary/20 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        }`;

    return (
        <aside className="fixed top-0 left-0 w-64 h-full bg-card border-r border-border/50 z-40 pt-16 flex flex-col transition-all duration-300">
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {/* 🔑 ITÉRATION SUR LES NOUVELLES SECTIONS */}
                {sections.map((section, index) => (
                    <div key={index} className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground pt-2 border-b border-border/50 pb-1">
                            {section.title}
                        </h3>
                        {section.items.map((item) => (
                            <Link key={item.path} to={item.path} className={getLinkClass(item.path)}>
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                ))}

                {/* Ajout des paramètres système pour rester accessible */}
                 <div className="space-y-2 border-t border-border/50 pt-4 mt-4">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground pb-1">
                        OUTILS
                    </h3>
                    <Link to="/admin/settings" className={getLinkClass("/admin/settings")}>
                        <Settings className="w-5 h-5" />
                        <span>Paramètres Système</span>
                    </Link>
                </div>
            </div>

            {/* Section Pied de page / Logout (inchangée) */}
            <div className="p-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground mb-3 truncate">
                    Connecté en tant que: <span className="text-foreground font-medium">{userName}</span>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;