// src/pages/Login.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from '../hooks/useAuth'; // ⬅️ DÉCOMMENTEZ si vous utilisez un hook global

const API_LOGIN_URL = "http://localhost:9090/api/auth/login";
const API_NAME_URL = "http://localhost:9090/api/client/name"; // Pour obtenir le nom après login

const Login = () => {
    const navigate = useNavigate();
    // const { setUserName } = useAuth(); // ⬅️ Utilisez ceci si vous avez un hook global

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Fonction pour récupérer le nom après un login réussi (utile pour mettre à jour l'état global)
    const fetchAndSetUserName = async () => {
        try {
            const response = await fetch(API_NAME_URL, { credentials: 'include' });
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.error("Failed to fetch user name after login:", error);
        }
        return null;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage({ type: null, message: '' }); 
        setIsLoading(true);

        try {
            const response = await fetch(API_LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include" // ESSENTIEL pour accepter le Set-Cookie JSESSIONID
            });

            if (response.ok) {
                // 1. Connexion réussie, le navigateur a maintenant le cookie JSESSIONID.
                setStatusMessage({ type: 'success', message: 'Login successful! Setting session...' });

                // 2. Récupérer le nom de l'utilisateur via la nouvelle API
                const fullName = await fetchAndSetUserName();
                
                // 3. Mettre à jour l'état d'authentification global (si un hook existe)
                // if (fullName && setUserName) {
                //     setUserName(fullName); 
                // }

                setStatusMessage({ type: 'success', message: 'Login successful! Redirecting to Stock List... 🚀' });

                // 4. Redirection vers StockList
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000); 
                
            } else if (response.status === 401) {
                setStatusMessage({ type: 'error', message: 'Login failed: Invalid email or password.' });
            } else {
                setStatusMessage({ type: 'error', message: `Server error (${response.status}). Please try again.` });
            }
        } catch (error) {
            console.error("Network or API error:", error);
            setStatusMessage({ type: 'error', message: 'Network Error: The Backend server might be unreachable.' });
        } finally {
            if (!response.ok) { // Only stop loading if it was an error
                 setIsLoading(false);
            }
        }
    };

    // ... (Le reste du rendu du Login.tsx, déjà en anglais/français mélangé)
    // NOTE: Le rendu du Login.tsx n'a pas été traduit en anglais dans la dernière étape
    
    // ... (Rendu du composant - Conserver la traduction anglaise fournie précédemment)
    
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden circuit-lines">
        {/* ... Background Style ... */}

        {/* Login Card (Translated to English based on previous steps) */}
        <div className="relative z-10 w-full max-w-md mx-4">
            <div className="gradient-card rounded-2xl border border-primary/20 p-8 shadow-[0_0_60px_hsla(189,100%,50%,0.15)]">
            
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <div className="text-4xl font-bold mb-2">
                            <span className="text-foreground">My</span>
                            <span className="text-primary glow-text">LB</span>
                        </div>
                    </Link>
                    <p className="text-muted-foreground text-sm">
                        Log in to your account
                    </p>
                </div>

                {/* Status Message Display */}
                {statusMessage.type && (
                    <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                        statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                        {statusMessage.message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-foreground">Password</Label>
                            <a href="#" className="text-xs text-primary hover:underline glow-text">
                                Forgot password?
                            </a>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <Button 
                        type="submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 glow-border transition-all duration-300 hover:shadow-[0_0_50px_hsla(189,100%,50%,0.5)]"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Connecting...' : 'Log In'}
                    </Button>
                    
                    {/* Sign Up Link */}
                    <div className="text-center">
                        <Link to="/sign_up" className="text-sm text-primary hover:underline glow-text font-medium">
                            Don't have an account? Sign Up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    </div>
    );
};

export default Login;