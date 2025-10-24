import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

// ----------------------------------------------------------------------
// 🚨 PLACEHOLDER AUTH HOOK (À REMPLACER par votre hook de contexte/état global)
// Ce hook gère la vérification de session et le déconnexion.
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
                // 1. Vérifie la session Spring Boot via l'API /api/client/name
                const response = await fetch("http://localhost:9090/api/client/name", { 
                    credentials: 'include' // ESSENTIEL
                });
                
                if (response.ok) {
                    const name = await response.text();
                    setUserName(name);
                    setIsAuthenticated(true);
                } else {
                    // 401 Unauthorized est géré ici. L'utilisateur est considéré déconnecté.
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
        // Optionnel : Appeler l'API de déconnexion Back-end (ex: /api/auth/logout)
        
        // Clear local state
        setUserName(null);
        setIsAuthenticated(false);
        
        // SÉCURITÉ ANTI-RETOUR : Redirige vers /login et REMPLACE l'entrée dans l'historique.
        navigate('/login', { replace: true }); 
    };

    return { userName, isAuthenticated, loadingAuth, logout };
};
// ----------------------------------------------------------------------


const Navbar = () => {
    const { userName, isAuthenticated, loadingAuth, logout } = useAuthPlaceholder(); 

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="text-2xl font-bold">
                            <span className="text-foreground">My</span>
                            <span className="text-primary glow-text">LB</span>
                        </div>
                    </Link>
                    
                    {/* Navigation Links (Translated) */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Home
                        </Link>
                        <Link to="/#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Why MyLB
                        </Link>
                        <Link to="/#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            About
                        </Link>
                    </div>

                    {/* Auth Area: Conditional Rendering */}
                    <div>
                        {loadingAuth ? (
                            // State: Loading 
                            <Button disabled className="bg-primary/50 text-primary-foreground font-semibold px-6">
                                Loading...
                            </Button>
                        ) : isAuthenticated ? (
                            // State: User is Logged In
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-foreground">
                                    Hello, {userName?.split(' ')[0] || 'User'}! 
                                </span>
                                <Button 
                                    onClick={logout} 
                                    className="bg-red-600 text-white hover:bg-red-700 font-semibold px-6 transition-all duration-300"
                                >
                                    Log Out
                                </Button>
                            </div>
                        ) : (
                            // State: User is Logged Out (401 received)
                            <Link to="/login">
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 glow-border transition-all duration-300 hover:shadow-[0_0_40px_hsla(189,100%,50%,0.4)]">
                                    Log In
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;