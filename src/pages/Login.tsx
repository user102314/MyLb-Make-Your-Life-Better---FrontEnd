// src/pages/Login.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer"; 
// import { useAuth } from '../hooks/useAuth'; 

// 🚨 VÉRIFIEZ L'URL
const API_LOGIN_URL = "http://localhost:9090/api/auth/login"; 
// NOTE: L'API /api/client/name n'est plus nécessaire si l'API /login retourne le nom et le rôle.
const API_NAME_URL = "http://localhost:9090/api/client/name"; 

// --- NOUVELLE INTERFACE POUR LA RÉPONSE DE LOGIN (Doit correspondre à AuthController.java) ---
interface LoginSuccessResponse {
    success: boolean;
    role: 'ADMIN' | 'USER'; // Rôle attendu du backend
    firstName: string;
}
// -----------------------------------------------------------------------------------------

interface ErrorResponse {
    error: string;
    message: string;
}

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isLoading, setIsLoading] = useState(false);

    // NOTE: Cette fonction peut être simplifiée si l'API /login retourne directement le nom.
    const fetchAndSetUserName = async () => {
        // ... (Logique inchangée)
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

        let response: Response | null = null;
        
        try {
            response = await fetch(API_LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include" 
            });
            
            // Tenter de lire le corps de la réponse JSON pour obtenir le rôle et le statut
            const responseBody: LoginSuccessResponse | ErrorResponse = await response.json();


            if (response.ok) {
                const data = responseBody as LoginSuccessResponse;
                const userFirstName = data.firstName || 'User';
                const userRole = data.role; // ⬅️ Récupération du Rôle

                setStatusMessage({ type: 'success', message: `Welcome, ${userFirstName}! Setting session and redirecting... 🚀` });
                
                // 🔑 LOGIQUE DE REDIRECTION CONDITIONNELLE
                const targetPath = userRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

                setTimeout(() => {
                    navigate(targetPath, { replace: true }); // Redirection vers le bon dashboard
                }, 1500);
                
            } else if (response.status === 401) {
                let errorMessage = 'Login failed: Invalid email or password.';
                
                // La réponse 401 de votre backend contient peut-être un message plus précis
                const errorBody = responseBody as ErrorResponse;
                if (errorBody && errorBody.message) {
                    errorMessage = `Login failed: ${errorBody.message}`;
                }
                
                setStatusMessage({ type: 'error', message: errorMessage });
            } else {
                let errorMessage = `Server error (${response.status}). Please try again.`;
                const errorBody = responseBody as ErrorResponse;
                 if (errorBody && errorBody.message) {
                    errorMessage = errorBody.message;
                 }
                setStatusMessage({ type: 'error', message: errorMessage });
            }
        } catch (error) {
            console.error("Network or API error:", error);
            setStatusMessage({ type: 'error', message: 'Network Error: The Backend server might be unreachable. Check CORS/connection.' });
        } finally {
             // 🚨 Correction : Ne pas désactiver le loading si la redirection est planifiée
             if (response === null || !response.ok) { 
                setIsLoading(false);
             }
        }
    };

    return (
        // 🚨 Changement : Le conteneur principal est flex-col et prend min-h-screen
        <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-x-hidden"> 
            
            {/* 🚨 Changement : L'élément 'main' prend l'espace restant (flex-grow) */}
            <main className="flex-grow flex items-center justify-center py-16 px-4 relative overflow-hidden">
                
                {/* Style de fond (inchangé) */}
                <div className="absolute inset-0 opacity-10 bg-grid-small-foreground/30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent"></div>


                {/* Login Card (inchangé) */}
                <div className="relative z-10 w-full max-w-md mx-4 transition-all duration-500 ease-in-out hover:scale-[1.01]">
                    <div className="rounded-2xl border border-primary/30 p-10 shadow-2xl bg-card/95 backdrop-blur-sm
                                     shadow-[0_0_100px_rgba(29,78,216,0.2),_0_0_40px_rgba(20,184,166,0.3)]">
                    
                        <div className="text-center mb-8">
                            <Link to="/" className="inline-block">
                                <div className="text-5xl font-extrabold tracking-tighter mb-2">
                                    <span className="text-foreground">My</span>
                                    <span className="text-primary glow-text">LB</span>
                                </div>
                            </Link>
                            <p className="text-muted-foreground mt-1 text-base font-light">
                                Connectez-vous à votre portail d'investissement.
                            </p>
                        </div>

                        {/* Status Message Display */}
                        {statusMessage.type && (
                            <div className={`p-3 mb-6 rounded-xl text-sm font-medium ${
                                statusMessage.type === 'success' 
                                    ? 'bg-green-600/20 text-green-300 border border-green-700/50' 
                                    : 'bg-red-600/20 text-red-300 border border-red-700/50'
                            }`}>
                                {statusMessage.message}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 border-border/50 bg-background/50 focus:border-primary/80 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-foreground font-semibold">Mot de passe</Label>
                                    <a href="#" className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors">
                                        Mot de passe oublié?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 border-border/50 bg-background/50 focus:border-primary/80 transition-all"
                                />
                            </div>
                            
                            <Button 
                                type="submit"
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-6 text-lg tracking-wide 
                                        shadow-[0_0_20px_hsla(189,100%,50%,0.4)] hover:shadow-[0_0_60px_hsla(189,100%,50%,0.6)] transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        {/* Assurez-vous d'importer Zap si vous utilisez lucide-react */}
                                        {/* <Zap className="w-4 h-4 mr-2 animate-spin" /> */} 
                                        Connexion en cours...
                                    </>
                                ) : 'Se connecter'}
                            </Button>
                            
                            {/* Sign Up Link */}
                            <div className="text-center pt-2">
                                <Link to="/sign_up" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Pas de compte ? <span className="font-semibold text-primary/90 hover:underline">Créer un compte</span>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Inclusion du Footer */}
            <Footer />
        </div>
    );
};

export default Login;