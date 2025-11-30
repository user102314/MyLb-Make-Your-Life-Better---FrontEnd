// src/pages/Login.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer"; 

const API_LOGIN_URL = "http://localhost:9090/api/auth/login"; 
const API_NAME_URL = "http://localhost:9090/api/client/name"; 

interface LoginSuccessResponse {
    success: boolean;
    role: 'ADMIN' | 'USER';
    firstName: string;
}

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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Animation 3D Bitcoin avec particules
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.5 + 0.2})`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas!.width) this.x = 0;
                else if (this.x < 0) this.x = canvas!.width;
                if (this.y > canvas!.height) this.y = 0;
                else if (this.y < 0) this.y = canvas!.height;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const particles: Particle[] = [];
        for (let i = 0; i < 150; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            if (!ctx || !canvas) return;
            
            ctx.fillStyle = 'rgba(10, 14, 23, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

        let response: Response | null = null;
        
        try {
            response = await fetch(API_LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include" 
            });
            
            const responseBody: LoginSuccessResponse | ErrorResponse = await response.json();

            if (response.ok) {
                const data = responseBody as LoginSuccessResponse;
                const userFirstName = data.firstName || 'User';
                const userRole = data.role;

                setStatusMessage({ type: 'success', message: `Bienvenue, ${userFirstName}! Redirection en cours... 🚀` });
                
                const targetPath = userRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

                setTimeout(() => {
                    navigate(targetPath, { replace: true });
                }, 1500);
                
            } else if (response.status === 401) {
                let errorMessage = 'Échec de connexion : Email ou mot de passe invalide.';
                
                const errorBody = responseBody as ErrorResponse;
                if (errorBody && errorBody.message) {
                    errorMessage = `Échec de connexion : ${errorBody.message}`;
                }
                
                setStatusMessage({ type: 'error', message: errorMessage });
            } else {
                let errorMessage = `Erreur serveur (${response.status}). Veuillez réessayer.`;
                const errorBody = responseBody as ErrorResponse;
                 if (errorBody && errorBody.message) {
                    errorMessage = errorBody.message;
                 }
                setStatusMessage({ type: 'error', message: errorMessage });
            }
        } catch (error) {
            console.error("Network or API error:", error);
            setStatusMessage({ type: 'error', message: 'Erreur réseau : Le serveur backend est peut-être inaccessible.' });
        } finally {
             if (response === null || !response.ok) { 
                setIsLoading(false);
             }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-x-hidden"> 
            
            {/* Canvas pour l'animation des particules */}
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 z-0"
                style={{ background: 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 50%, #0a0e17 100%)' }}
            />

            {/* Bitcoin 3D Icon Flottant */}
            <div className="absolute top-1/4 right-10 z-10 hidden lg:block">
                <div className="relative w-32 h-32">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full 
                                    animate-pulse shadow-2xl shadow-blue-500/50 rotate-0 hover:rotate-180 
                                    transition-transform duration-1000">
                        <div className="absolute inset-2 bg-[#0a0e17] rounded-full flex items-center justify-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                ₿
                            </div>
                        </div>
                    </div>
                    {/* Effet de glow animé */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full 
                                    opacity-20 blur-xl animate-pulse"></div>
                </div>
            </div>

            {/* Points lumineux décoratifs */}
            <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
            <div className="absolute bottom-40 left-20 w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"></div>
            <div className="absolute top-60 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>

            <main className="flex-grow flex items-center justify-center py-16 px-4 relative z-10">
                
                {/* Grille animée en arrière-plan */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(120,119,198,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.3)_1px,transparent_1px)] bg-[size:70px_70px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                
                {/* Carte de connexion améliorée */}
                <div className="relative z-20 w-full max-w-md mx-4 transition-all duration-500 ease-in-out hover:scale-[1.01]">
                    <div className="rounded-2xl border border-primary/30 p-10 shadow-2xl bg-card/95 backdrop-blur-xl
                                     shadow-[0_0_100px_rgba(29,78,216,0.3),_0_0_40px_rgba(20,184,166,0.4)]
                                     relative overflow-hidden">
                        
                        {/* Effet de bordure animée */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl 
                                        animate-gradient-x"></div>
                    
                        <div className="text-center mb-8 relative z-10">
                            <Link to="/" className="inline-block transform hover:scale-105 transition-transform duration-300">
                                <div className="text-5xl font-extrabold tracking-tighter mb-2">
                                    <span className="text-foreground">My</span>
                                    <span className="text-primary glow-text animate-pulse">LB</span>
                                </div>
                            </Link>
                            <p className="text-muted-foreground mt-1 text-base font-light">
                                Accédez à votre portail d'investissement sécurisé
                            </p>
                        </div>

                        {/* Status Message Display amélioré */}
                        {statusMessage.type && (
                            <div className={`p-4 mb-6 rounded-xl text-sm font-medium relative overflow-hidden ${
                                statusMessage.type === 'success' 
                                    ? 'bg-green-600/20 text-green-300 border border-green-700/50' 
                                    : 'bg-red-600/20 text-red-300 border border-red-700/50'
                            }`}>
                                <div className={`absolute inset-0 ${
                                    statusMessage.type === 'success' 
                                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
                                        : 'bg-gradient-to-r from-red-500/10 to-pink-500/10'
                                }`}></div>
                                <span className="relative z-10">{statusMessage.message}</span>
                            </div>
                        )}

                        {/* Formulaire amélioré */}
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-foreground font-semibold flex items-center">
                                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                        Email
                                    </span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="vous@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 border-border/50 bg-background/80 focus:border-primary/80 
                                               transition-all duration-300 backdrop-blur-sm
                                               focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-foreground font-semibold flex items-center">
                                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                            Mot de passe
                                        </span>
                                    </Label>
                                    <a href="#" className="text-sm text-primary hover:underline hover:text-primary/80 
                                                          transition-colors duration-300">
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
                                    className="h-12 border-border/50 bg-background/80 focus:border-primary/80 
                                               transition-all duration-300 backdrop-blur-sm
                                               focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                />
                            </div>
                            
                            <Button 
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-primary-foreground 
                                         hover:from-blue-700 hover:to-purple-700 font-bold py-6 text-lg tracking-wide 
                                         shadow-[0_0_30px_hsla(240,100%,50%,0.4)] hover:shadow-[0_0_50px_hsla(240,100%,50%,0.6)] 
                                         transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden group"
                                disabled={isLoading}
                            >
                                {/* Effet de brillance au survol */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                                -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] 
                                                transition-transform duration-1000"></div>
                                
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Connexion en cours...
                                    </div>
                                ) : (
                                    'Se connecter'
                                )}
                            </Button>
                            
                            {/* Lien d'inscription amélioré */}
                            <div className="text-center pt-4">
                                <Link to="/sign_up" className="group text-sm text-muted-foreground hover:text-primary transition-all duration-300">
                                    Pas de compte ? 
                                    <span className="font-semibold text-primary/90 hover:underline ml-1 
                                                    bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent
                                                    group-hover:from-blue-300 group-hover:to-purple-400">
                                        Créer un compte
                                    </span>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Login;