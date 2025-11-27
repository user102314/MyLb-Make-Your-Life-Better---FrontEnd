// src/components/admin/AdminNavbar.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { 
  Zap, Bell, UserCircle, ChevronDown, LogOut,
  Settings, Shield, Users, Building, TrendingUp,
  FileText, Landmark, CheckCircle, Fingerprint,
  BarChart3, MessageSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from '../../img/logo.png';

// Structure du menu admin
const adminMenuSections = [
  { 
    title: "Vues Générales", 
    icon: BarChart3, 
    links: [
      { name: "Vue Générale", path: "dashboard", icon: Zap },
      { name: "Tous les Utilisateurs", path: "all-users", icon: Users },
      { name: "Toutes les Sociétés", path: "all-companies", icon: Building },
      { name: "Toutes les Actions", path: "all-stocks", icon: TrendingUp },
      { name: "Tous les Rapports", path: "all-reports", icon: FileText },
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

// ----------------------------------------------------------------------
// Hook d'authentification admin
// ----------------------------------------------------------------------
const useAdminAuth = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            setLoadingAuth(true);
            try {
                const response = await fetch("http://localhost:9090/api/admin/name", { 
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const name = await response.text();
                    setUserName(name);
                    setIsAuthenticated(true);
                } else {
                    setUserName(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Admin authentication check failed:", error);
                setUserName(null);
                setIsAuthenticated(false);
            } finally {
                setLoadingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await fetch("http://localhost:9090/api/auth/logout", {
                method: "POST",
                credentials: 'include'
            });
        } catch (error) {
            console.error("Admin logout API call failed:", error);
        }
        
        setUserName(null);
        setIsAuthenticated(false);
        navigate('/admin/login', { replace: true });
    };

    return { userName, isAuthenticated, loadingAuth, logout };
};

const AdminNavbar = () => {
    const { userName, isAuthenticated, loadingAuth, logout } = useAdminAuth();

    return (
        <>
            {/* Styles personnalisés pour le scroll - identique au user */}
            <style>
                {`
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(100, 116, 139, 0.3) transparent;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.3);
                    border-radius: 3px;
                    transition: all 0.3s ease;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.5);
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:active {
                    background: rgba(100, 116, 139, 0.7);
                }
                
                /* Style pour le dégradé de scroll */
                .scroll-gradient {
                    mask-image: linear-gradient(
                        to bottom,
                        transparent 0%,
                        black 10%,
                        black 90%,
                        transparent 100%
                    );
                }
                
                /* Animation smooth pour le scroll */
                .smooth-scroll {
                    scroll-behavior: smooth;
                }
                
                /* Effet de profondeur pour le scroll */
                .scroll-depth {
                    box-shadow: 
                        inset 0 10px 10px -10px rgba(0,0,0,0.1),
                        inset 0 -10px 10px -10px rgba(0,0,0,0.1);
                }

                /* Animation pour le badge de notification */
                @keyframes pulse-gentle {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .animate-pulse-gentle {
                    animation: pulse-gentle 2s infinite;
                }
                `}
            </style>

           <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                   <div className="flex h-16 items-center justify-between">
                       {/* Logo */}
                       <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
                           <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden">
                               <img 
                                   src={logo} 
                                   alt="MyLB Capital Admin Logo" 
                                   className="w-full h-full object-cover"
                               />
                           </div>
                           <div className="flex flex-col">
                               <span className="text-lg font-semibold text-foreground leading-none">MyLB</span>
                               <span className="text-xs text-purple-500 font-bold leading-none">ADMIN</span>
                           </div>
                       </Link>
                        
                        {/* Navigation Links Admin */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/admin/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
                                Tableau de Bord
                            </Link>
                            <Link to="/admin/all-users" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
                                Utilisateurs
                            </Link>
                            <Link to="/admin/all-companies" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
                                Sociétés
                            </Link>
                            <Link to="/admin/company-application" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
                                Validations
                            </Link>
                        </div>

                        {/* Auth Area */}
                        <div className="flex items-center space-x-4">
                            {loadingAuth ? (
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                                    <div className="hidden sm:block w-20 h-4 bg-muted rounded animate-pulse"></div>
                                </div>
                            ) : isAuthenticated ? (
                                <div className="flex items-center space-x-3">
                                    {/* Icône de notifications */}
                                    <div className="relative">
                                        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200">
                                            <Bell className="h-5 w-5" />
                                            {/* Badge de notification */}
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-background animate-pulse-gentle"></span>
                                        </Button>
                                    </div>

                                    {/* Menu déroulant admin */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                className="flex items-center space-x-3 hover:bg-accent/50 transition-colors duration-200 px-3 py-2 rounded-lg"
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-semibold">
                                                        {userName?.charAt(0).toUpperCase() || 'A'}
                                                    </span>
                                                </div>
                                                <div className="hidden sm:flex flex-col items-start">
                                                    <span className="text-sm font-medium text-foreground leading-none">
                                                        {userName?.split(' ')[0] || 'Admin'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground leading-none">
                                                        Administrateur
                                                    </span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent 
                                            className="w-80 bg-background/95 backdrop-blur-xl border-border/40 scroll-gradient scroll-depth" 
                                            align="end"
                                            sideOffset={8}
                                        >
                                            {/* En-tête du profil admin */}
                                            <DropdownMenuLabel className="flex items-center space-x-3 p-4 border-b border-border/20">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-semibold">
                                                        {userName?.charAt(0).toUpperCase() || 'A'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {userName || 'Administrateur'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Super Administrateur
                                                    </span>
                                                </div>
                                            </DropdownMenuLabel>

                                            {/* Sections du menu admin avec scroll personnalisé */}
                                            <div className="max-h-80 overflow-y-auto custom-scrollbar smooth-scroll">
                                                {adminMenuSections.map((section, sectionIndex) => (
                                                    <div key={section.title} className="border-b border-border/10 last:border-b-0">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuLabel className="flex items-center space-x-2 text-xs font-semibold text-purple-500 uppercase tracking-wider px-3 py-3 bg-purple-500/5 sticky top-0 z-10 backdrop-blur-sm">
                                                                <section.icon className="h-3.5 w-3.5" />
                                                                <span>{section.title}</span>
                                                            </DropdownMenuLabel>
                                                            <div className="px-1 pb-1">
                                                                {section.links.map((link) => (
                                                                    <DropdownMenuItem key={link.name} asChild className="focus:bg-accent/30 focus:text-foreground">
                                                                        <Link 
                                                                            to={`/admin/${link.path}`}
                                                                            className="flex items-center space-x-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-accent/30 rounded-md transition-all duration-200 group"
                                                                        >
                                                                            <div className="flex items-center justify-center w-5 h-5">
                                                                                <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                                                                            </div>
                                                                            <span className="text-foreground group-hover:text-foreground font-medium transition-colors duration-200">
                                                                                {link.name}
                                                                            </span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </div>
                                                        </DropdownMenuGroup>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Déconnexion */}
                                            <div className="border-t border-border/20 p-2">
                                                <DropdownMenuItem 
                                                    onClick={logout}
                                                    className="flex items-center space-x-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-destructive/10 hover:text-destructive rounded-md transition-all duration-200 group focus:bg-destructive/10 focus:text-destructive"
                                                >
                                                    <div className="flex items-center justify-center w-5 h-5">
                                                        <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                                    </div>
                                                    <span className="font-medium">Déconnexion</span>
                                                </DropdownMenuItem>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link to="/admin/login">
                                        <Button 
                                            variant="ghost" 
                                            className="text-foreground hover:bg-accent/50 transition-colors duration-200"
                                        >
                                            Connexion Admin
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default AdminNavbar;