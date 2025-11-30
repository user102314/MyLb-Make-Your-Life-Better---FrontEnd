import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react"; 

const API_SIGNUP_URL = 'http://localhost:9090/api/auth/signup';

// --------------------------------------------------------------------------
// 🔑 FONCTION DE VALIDATION DU MOT DE PASSE SÉCURISÉ (INCHANGÉE)
// --------------------------------------------------------------------------
const isPasswordSecure = (password: string): { isValid: boolean, error: string | null } => {
    if (password.length < 8) {
        return { isValid: false, error: "Le mot de passe doit contenir au moins 8 caractères." };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, error: "Doit inclure au moins une lettre majuscule." };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, error: "Doit inclure au moins une lettre minuscule." };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, error: "Doit inclure au moins un chiffre (0-9)." };
    }
    if (!/[^a-zA-Z0-9\s]/.test(password)) { // Caractère spécial
        return { isValid: false, error: "Doit inclure au moins un caractère spécial." };
    }
    
    return { isValid: true, error: null };
};
// --------------------------------------------------------------------------

const Signup = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    const passwordValidation = isPasswordSecure(password);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProfileImage(e.target.files[0]);
        } else {
            setProfileImage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        // 1. Frontend Validation
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Les mots de passe ne correspondent pas !" });
            setLoading(false);
            return;
        }

        const validationResult = isPasswordSecure(password);
        if (!validationResult.isValid) {
            setMessage({ type: 'error', text: `Mot de passe non sécurisé : ${validationResult.error}` });
            setLoading(false);
            return;
        }

        if (!profileImage) {
            setMessage({ type: 'error', text: "Veuillez sélectionner une image de profil." });
            setLoading(false);
            return;
        }

        // 2. Create FormData payload
        const formPayload = new FormData();
        formPayload.append('firstName', firstName);
        formPayload.append('lastName', lastName);
        formPayload.append('birthDate', birthDate);
        formPayload.append('email', email);
        formPayload.append('password', password);
        formPayload.append('profileImage', profileImage);

        // 3. API Call
        try {
            const response = await fetch(API_SIGNUP_URL, {
                method: 'POST',
                body: formPayload, 
            });

            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: `Inscription réussie pour ${data.firstName} ! Redirection vers la connexion... 🚀` });
                
                setTimeout(() => {
                    navigate('/login');
                }, 2000); 
                
            } else {
                const errorText = await response.text();
                const userError = errorText.includes("already exists") ? "Cet email est déjà utilisé." : `Échec de l'inscription : ${errorText || response.statusText}`;
                setMessage({ type: 'error', text: userError });
                setLoading(false);
            }

        } catch (error) {
            console.error('Network/fetch error:', error);
            setMessage({ type: 'error', text: "Erreur réseau ou serveur inaccessible. 💔" });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            
            {/* Canvas pour l'animation des particules */}
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 z-0"
                style={{ background: 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 50%, #0a0e17 100%)' }}
            />

            {/* Bitcoin 3D Icon Flottant */}
            <div className="absolute top-1/4 left-10 z-10 hidden lg:block">
                <div className="relative w-32 h-32">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full 
                                    animate-pulse shadow-2xl shadow-purple-500/50 rotate-0 hover:rotate-180 
                                    transition-transform duration-1000">
                        <div className="absolute inset-2 bg-[#0a0e17] rounded-full flex items-center justify-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                                ₿
                            </div>
                        </div>
                    </div>
                    {/* Effet de glow animé */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full 
                                    opacity-20 blur-xl animate-pulse"></div>
                </div>
            </div>

            {/* Points lumineux décoratifs */}
            <div className="absolute top-20 right-10 w-4 h-4 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
            <div className="absolute bottom-40 right-20 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
            <div className="absolute top-60 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>

            {/* Contenu principal */}
            <main className="flex-grow flex items-center justify-center relative z-10 w-full px-4 sm:px-6 py-8">
                
                {/* Grille animée en arrière-plan */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(120,119,198,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.3)_1px,transparent_1px)] bg-[size:70px_70px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                
                <div className="w-full max-w-2xl">
                    <div className="relative rounded-2xl border border-primary/30 p-8 shadow-2xl bg-card/95 backdrop-blur-xl
                                     shadow-[0_0_100px_rgba(147,51,234,0.3),_0_0_40px_rgba(59,130,246,0.4)]
                                     overflow-hidden">
                        
                        {/* Effet de bordure animée */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-600/10 rounded-2xl 
                                        animate-gradient-x"></div>
                    
                        <div className="text-center mb-8 relative z-10">
                            <Link to="/" className="inline-block transform hover:scale-105 transition-transform duration-300">
                                <div className="text-5xl font-extrabold tracking-tighter mb-2">
                                    <span className="text-foreground">My</span>
                                    <span className="text-primary glow-text animate-pulse">LB</span>
                                </div>
                            </Link>
                            <p className="text-muted-foreground mt-1 text-base font-light">
                                Rejoignez la révolution financière tunisienne
                            </p>
                        </div>

                        {/* Message Display amélioré */}
                        {message && (
                            <div className={`p-4 mb-6 rounded-xl text-sm font-medium relative overflow-hidden ${
                                message.type === 'success' 
                                    ? 'bg-green-600/20 text-green-300 border border-green-700/50' 
                                    : 'bg-red-600/20 text-red-300 border border-red-700/50'
                            }`}>
                                <div className={`absolute inset-0 ${
                                    message.type === 'success' 
                                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
                                        : 'bg-gradient-to-r from-red-500/10 to-pink-500/10'
                                }`}></div>
                                <span className="relative z-10">{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-foreground font-semibold flex items-center">
                                        <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                                            Nom
                                        </span>
                                    </Label>
                                    <Input 
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)} 
                                        required 
                                        disabled={loading}
                                        className="border-border/50 bg-background/80 focus:border-primary/80 
                                                   transition-all duration-300 backdrop-blur-sm h-12
                                                   focus:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-foreground font-semibold flex items-center">
                                        <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                                            Prénom
                                        </span>
                                    </Label>
                                    <Input 
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)} 
                                        required 
                                        disabled={loading}
                                        className="border-border/50 bg-background/80 focus:border-primary/80 
                                                   transition-all duration-300 backdrop-blur-sm h-12
                                                   focus:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-foreground font-semibold flex items-center">
                                    <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                                        Date de Naissance
                                    </span>
                                </Label>
                                <Input 
                                    type="date" 
                                    value={birthDate} 
                                    onChange={(e)=>setBirthDate(e.target.value)} 
                                    required 
                                    disabled={loading}
                                    max={new Date().toISOString().split("T")[0]}
                                    className="border-border/50 bg-background/80 focus:border-primary/80 
                                               transition-all duration-300 backdrop-blur-sm h-12
                                               focus:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="profile-image" className="text-foreground font-semibold flex items-center">
                                    <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                                        Image de Profil
                                    </span>
                                </Label>
                                <Input
                                    id="profile-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file:text-sm file:font-semibold file:bg-primary/10 file:text-primary file:border-0 hover:file:bg-primary/20
                                               border-border/50 bg-background/80 transition-all duration-300 backdrop-blur-sm h-12"
                                    required
                                    disabled={loading}
                                />
                                {profileImage && (
                                    <p className="text-xs text-muted-foreground mt-2 bg-background/50 p-2 rounded border border-border/70">
                                        📸 Fichier sélectionné : {profileImage.name}
                                    </p>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                <Label className="text-foreground font-semibold flex items-center">
                                    <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                                        Email
                                    </span>
                                </Label>
                                <Input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    disabled={loading}
                                    className="border-border/50 bg-background/80 focus:border-primary/80 
                                               transition-all duration-300 backdrop-blur-sm h-12
                                               focus:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-foreground font-semibold flex items-center">
                                    <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                                        Mot de Passe
                                    </span>
                                </Label>
                                <Input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    disabled={loading}
                                    className="border-border/50 bg-background/80 focus:border-primary/80 
                                               transition-all duration-300 backdrop-blur-sm h-12
                                               focus:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                                />
                                
                                {password.length > 0 && (
                                    <div className="p-4 bg-background/50 rounded-xl border border-border/70 backdrop-blur-sm">
                                        <ul className="text-xs space-y-2">
                                            {[
                                                { condition: password.length >= 8, text: '8 caractères minimum' },
                                                { condition: /[A-Z]/.test(password), text: 'Au moins une Majuscule' },
                                                { condition: /[a-z]/.test(password), text: 'Au moins une Minuscule' },
                                                { condition: /[0-9]/.test(password), text: 'Au moins un Chiffre' },
                                                { condition: /[^a-zA-Z0-9\s]/.test(password), text: 'Au moins un Caractère Spécial' }
                                            ].map((item, index) => (
                                                <li key={index} className={`flex items-center ${item.condition ? "text-green-400" : "text-red-400"}`}>
                                                    <span className="mr-2">{item.condition ? '✓' : '✗'}</span>
                                                    {item.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-foreground font-semibold flex items-center">
                                    <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                                        Confirmer le Mot de Passe
                                    </span>
                                </Label>
                                <Input 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    required 
                                    disabled={loading}
                                    className="border-border/50 bg-background/80 focus:border-primary/80 
                                               transition-all duration-300 backdrop-blur-sm h-12
                                               focus:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                                />
                                {confirmPassword && password && password !== confirmPassword && (
                                    <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/30">
                                        ⚠️ Les mots de passe ne correspondent pas.
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !passwordValidation.isValid || password !== confirmPassword}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-primary-foreground 
                                         hover:from-purple-700 hover:to-blue-700 font-bold py-6 text-lg tracking-wide 
                                         shadow-[0_0_30px_hsla(260,100%,50%,0.4)] hover:shadow-[0_0_50px_hsla(260,100%,50%,0.6)] 
                                         transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden group"
                            >
                                {/* Effet de brillance au survol */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                                -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] 
                                                transition-transform duration-1000"></div>
                                
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Inscription en cours...
                                    </div>
                                ) : (
                                    "Créer mon compte"
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-sm mt-6 text-muted-foreground relative z-10">
                            Vous avez déjà un compte ?{" "}
                            <Link to="/login" className="text-primary glow-text hover:underline transition-all duration-300
                                                       bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent
                                                       hover:from-purple-300 hover:to-blue-400">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer amélioré */}
            <footer className="w-full p-4 text-center text-xs text-muted-foreground/70 bg-background/80 border-t border-border/50 backdrop-blur-sm z-20 relative">
                <div className="container mx-auto">
                    &copy; {new Date().getFullYear()} MyLB. Tous droits réservés. | 
                    <Link to="/terms" className="hover:text-primary transition-colors duration-300 ml-1 underline-offset-4 hover:underline
                                               bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                        Conditions Générales
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default Signup;