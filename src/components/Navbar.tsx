import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, Settings, Lock, Shield, ListTodo, 
  Building, PlusCircle, Briefcase, TrendingUp, 
  Sliders, Zap, DollarSign, CreditCard, 
  MessageSquare, ChevronDown, LogOut 
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

// Structure du menu utilisateur
const userMenuSections = [
  { 
    title: "Profile Section", 
    icon: User, 
    links: [
      { name: "View Profile", path: "profile", icon: User },
      { name: "Modify Profile", path: "Editprofile", icon: Settings },
      { name: "Modify Password", path: "PasswordChange", icon: Lock },
      { name: "Confidentiality", path: "Confidentiality", icon: Shield },
      { name: "Verify Account", path: "verify", icon: ListTodo }
    ]
  },
  { 
    title: "Company Section", 
    icon: Building, 
    links: [
      { name: "Begin Your Company Stock", path: "BeginCompanyStock", icon: PlusCircle },
      { name: "My Companies", path: "ListComponey", icon: Building },
    ]
  },
  { 
    title: "Stocks Section", 
    icon: Briefcase, 
    links: [
      { name: "Available Stocks", path: "stocklist", icon: TrendingUp },
      { name: "Stocks Market", path: "market", icon: Sliders },
      { name: "Best Selling Stocks", path: "/stocklist/bestselling", icon: Zap },
      { name: "Recommended Stocks", path: "/stocklist/recommended", icon: DollarSign },
    ]
  },
  { 
    title: "Management Section", 
    icon: CreditCard, 
    links: [
      { name: "View Wallet", path: "wallet", icon: CreditCard },
      { name: "View Transactions", path: "Transactions", icon: DollarSign },
      { name: "Statistique Sold", path: "statistique", icon: DollarSign },
      { name: "View Card Detail", path: "cards", icon: CreditCard },
      { name: "View Stocks Wallet", path: "StockWallet", icon: Briefcase },
      { name: "Chat with Support", path: "support", icon: MessageSquare },
    ]
  },
];

// ----------------------------------------------------------------------
// Hook d'authentification
// ----------------------------------------------------------------------
const useAuthPlaceholder = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            setLoadingAuth(true);
            try {
                const response = await fetch("http://localhost:9090/api/client/name", { 
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
                console.error("Authentication check failed:", error);
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
            console.error("Logout API call failed:", error);
        }
        
        setUserName(null);
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
    };

    return { userName, isAuthenticated, loadingAuth, logout };
};

const Navbar = () => {
    const { userName, isAuthenticated, loadingAuth, logout } = useAuthPlaceholder();

    return (
        <>
            {/* Styles personnalisés pour le scroll */}
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
                `}
            </style>

            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
                                <span className="text-white font-bold text-lg">ML</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-foreground leading-none">MyLB</span>
                                <span className="text-xs text-muted-foreground leading-none">Capital</span>
                            </div>
                        </Link>
                        
                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/Dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
                                Dashboard
                            </Link>
                            <Link to="/Dashboard/market" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
                                Market
                            </Link>
                            <Link to="/Dashboard/ListComponey" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
                                Companies
                            </Link>
                            <Link to="/Dashboard/support" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2">
                                Support
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
                                <div className="flex items-center space-x-4">
                                    {/* Menu déroulant utilisateur */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                className="flex items-center space-x-3 hover:bg-accent/50 transition-colors duration-200 px-3 py-2 rounded-lg"
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-semibold">
                                                        {userName?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <div className="hidden sm:flex flex-col items-start">
                                                    <span className="text-sm font-medium text-foreground leading-none">
                                                        {userName?.split(' ')[0] || 'User'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground leading-none">
                                                        My Account
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
                                            {/* En-tête du profil */}
                                            <DropdownMenuLabel className="flex items-center space-x-3 p-4 border-b border-border/20">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-semibold">
                                                        {userName?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {userName || 'User'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Premium Investor
                                                    </span>
                                                </div>
                                            </DropdownMenuLabel>

                                            {/* Sections du menu avec scroll personnalisé */}
                                            <div className="max-h-80 overflow-y-auto custom-scrollbar smooth-scroll">
                                                {userMenuSections.map((section, sectionIndex) => (
                                                    <div key={section.title} className="border-b border-border/10 last:border-b-0">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuLabel className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-3 bg-accent/10 sticky top-0 z-10 backdrop-blur-sm">
                                                                <section.icon className="h-3.5 w-3.5" />
                                                                <span>{section.title}</span>
                                                            </DropdownMenuLabel>
                                                            <div className="px-1 pb-1">
                                                                {section.links.map((link) => (
                                                                    <DropdownMenuItem key={link.name} asChild className="focus:bg-accent/30 focus:text-foreground">
                                                                        <Link 
                                                                            to={link.path}
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
                                                    <span className="font-medium">Log Out</span>
                                                </DropdownMenuItem>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link to="/login">
                                        <Button 
                                            variant="ghost" 
                                            className="text-foreground hover:bg-accent/50 transition-colors duration-200"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
                                            Get Started
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

export default Navbar;