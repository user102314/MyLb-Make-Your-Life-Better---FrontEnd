// src/components/admin/AdminSidebar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LogOut, User, DollarSign, Settings, Shield, Zap, List, 
    Landmark, FileText, CheckCircle, Fingerprint, MessageSquare,
    Building, TrendingUp, CreditCard, BarChart3, Users
} from 'lucide-react';

// --- Hook d'authentification pour AdminSidebar ---
const useAdminSidebarAuth = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminName = async () => {
            try {
                const response = await fetch("http://localhost:9090/api/admin/name", { 
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const name = await response.text();
                    setUserName(name);
                } else {
                    setUserName('Administrateur');
                }
            } catch (error) {
                console.error("Failed to fetch admin name:", error);
                setUserName('Administrateur');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminName();
    }, []);

     const logout = async () => {
        try {
            await fetch("http://localhost:9090/api/auth/logout", {
                method: "POST",
                credentials: 'include'
            });
        } catch (error) {
            console.error("Logout failed:", error);
        }
        
        setUserName('');
        navigate('/login', { replace: true });
    };

    return { userName, loading, logout };
};

// --- Admin Sidebar Navigation Data ---
const adminNavItems = [
    { 
        title: "Vues Générales", 
        icon: BarChart3, 
        links: [
            { name: "Vue Générale", path: "dashboard", icon: Zap },
            { name: "Tout les utilisatuers", path: "AllUsersPage", icon: Users },
            { name: "Toutes les Sociétés", path: "company-application", icon: Building },
            { name: "Toutes les Actions", path: "market", icon: TrendingUp },
        ]
    },
    { 
        title: "Applications & Validation", 
        icon: CheckCircle, 
        links: [
            { name: "Validation Sociétés", path: "company-application", icon: Landmark },
            { name: "Validation Identité", path: "AdminVerifyUser", icon: Fingerprint },
        ]
    },
    { 
        title: "Gestion & Outils", 
        icon: Settings, 
        links: [
            { name: "Paramètres Système", path: "settings", icon: Settings },
            { name: "Support Technique", path: "admin-support", icon: MessageSquare },
        ]
    }
];

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const { userName, loading, logout } = useAdminSidebarAuth();

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logout();
    };

    // Skeleton loading pendant le chargement
    if (loading) {
        return (
            <aside className="w-64 bg-card/90 border-r border-border h-[calc(100vh-4rem)] flex flex-col flex-shrink-0 shadow-2xl fixed left-0 top-16 z-30 backdrop-blur-md">
                <div className="p-4 border-b border-border/50 bg-card/95 flex-shrink-0">
                    <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <div className="px-4 space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="mb-6">
                                <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, j) => (
                                        <div key={j} className="h-8 bg-muted rounded"></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-64 bg-card/90 border-r border-border h-[calc(100vh-4rem)] flex flex-col flex-shrink-0 shadow-2xl fixed left-0 top-16 z-30 backdrop-blur-md">
            
            {/* Section du Nom d'Administrateur - FIXE */}
            <div className="p-4 border-b border-border/50 bg-card/95 flex-shrink-0">
                <div className="text-xl font-bold text-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                        
                        <span className="flex-grow min-w-0">
                            <span className="bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent font-extrabold truncate block">
                                {userName || 'Administrateur'}
                            </span>
                            <span className="text-xs text-muted-foreground font-light block">
                                Panneau d'Administration
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Links - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 space-y-6">
                    {adminNavItems.map((section, index) => {
                        const SectionIcon = section.icon;
                        return (
                            <div key={index} className="mb-6">
                                <h3 className="text-xs uppercase font-bold text-purple-500 flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
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
                                                    to={`/admin/${link.path}`}
                                                    className={`
                                                        block text-sm py-2 px-3 rounded-lg font-medium transition-all duration-200
                                                        ${isActive 
                                                            ? 'text-foreground bg-purple-500/10 border-l-4 border-purple-500 shadow-inner shadow-purple-500/20' 
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
                    to="/admin/admin-support"
                    className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg font-medium text-purple-500 hover:bg-purple-500/10 transition-colors"
                >
                    <MessageSquare className="w-4 h-4" />
                    Support Technique
                </Link>
                <a 
                    href="login" 
                    onClick={handleLogout} 
                    className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                </a>
            </div>
        </aside>
    );
};

export default AdminSidebar;