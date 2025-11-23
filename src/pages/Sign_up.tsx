import { useState } from "react";
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

    // Render component
    return (
        // Le conteneur principal gère le min-h-screen et le flex-col pour empiler le contenu et le footer
        <div className="min-h-screen flex flex-col relative overflow-hidden circuit-lines">
            
            {/* Arrière-plan et effets visuels */}
            <div className="absolute inset-0 gradient-hero"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-2xl bg-primary/10 rounded-full blur-[120px]"></div>

            {/* Contenu principal (Formulaire) - Flex grow pour prendre l'espace disponible */}
            <main className="flex-grow flex items-center justify-center relative z-10 w-full px-4 sm:px-6 py-8"> {/* Ajout de px pour la réactivité, py pour l'espace minimal */}
                <div className="w-full max-w-md">
                    <div className="gradient-card rounded-2xl border border-primary/20 p-8 shadow-[0_0_60px_hsla(189,100%,50%,0.15)]">
                        <div className="text-center mb-6">
                            <Link to="/" className="inline-block">
                                <div className="text-4xl font-bold mb-2">
                                    <span className="text-foreground">My</span>
                                    <span className="text-primary glow-text">LB</span>
                                </div>
                            </Link>
                            <p className="text-muted-foreground text-sm">Créez votre compte</p>
                        </div>

                        {/* API Message Display */}
                        {message && (
                            <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-600/70 text-white' : 'bg-red-600/70 text-white'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Nom</Label>
                                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} />
                                </div>
                                <div>
                                    <Label>Prénom</Label>
                                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} />
                                </div>
                            </div>

                            <div>
                                <Label>Date de Naissance</Label>
                                <Input 
                                    type="date" 
                                    value={birthDate} 
                                    onChange={(e)=>setBirthDate(e.target.value)} 
                                    required 
                                    disabled={loading}
                                    max={new Date().toISOString().split("T")[0]} 
                                />
                            </div>

                            <div>
                                <Label htmlFor="profile-image">Image de Profil</Label>
                                <Input
                                    id="profile-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file:text-sm file:font-semibold file:bg-primary/10 file:text-primary file:border-0 hover:file:bg-primary/20"
                                    required
                                    disabled={loading}
                                />
                                {profileImage && <p className="text-xs text-muted-foreground mt-1">Fichier sélectionné : {profileImage.name}</p>}
                            </div>
                            
                            <div>
                                <Label>Email</Label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                            </div>

                            <div className="space-y-2">
                                <Label>Mot de Passe</Label>
                                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                                
                                {password.length > 0 && (
                                    <ul className="text-xs space-y-1 p-2 bg-background/50 rounded border border-border/70">
                                        <li className={password.length >= 8 ? "text-green-500" : "text-red-500"}>
                                            {password.length >= 8 ? '✓' : '✗'} 8 caractères minimum
                                        </li>
                                        <li className={/[A-Z]/.test(password) ? "text-green-500" : "text-red-500"}>
                                            {/[A-Z]/.test(password) ? '✓' : '✗'} Au moins une Majuscule
                                        </li>
                                        <li className={/[a-z]/.test(password) ? "text-green-500" : "text-red-500"}>
                                            {/[a-z]/.test(password) ? '✓' : '✗'} Au moins une Minuscule
                                        </li>
                                        <li className={/[0-9]/.test(password) ? "text-green-500" : "text-red-500"}>
                                            {/[0-9]/.test(password) ? '✓' : '✗'} Au moins un Chiffre
                                        </li>
                                        <li className={/[^a-zA-Z0-9\s]/.test(password) ? "text-green-500" : "text-red-500"}>
                                            {/[^a-zA-Z0-9\s]/.test(password) ? '✓' : '✗'} Au moins un Caractère Spécial
                                        </li>
                                    </ul>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Confirmer le Mot de Passe</Label>
                                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
                                {confirmPassword && password && password !== confirmPassword && (
                                    <p className="text-sm text-red-500">Les mots de passe ne correspondent pas.</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !passwordValidation.isValid || password !== confirmPassword}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 glow-border transition-all duration-300 hover:shadow-[0_0_50px_hsla(189,100%,50%,0.5)]"
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inscription en cours...</>
                                ) : (
                                    "S'inscrire"
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-sm mt-6 text-muted-foreground">
                            Vous avez déjà un compte ?{" "}
                            <Link to="/login" className="text-primary glow-text hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer - Reste fixe en bas */}
            <footer className="w-full p-4 text-center text-xs text-muted-foreground/70 bg-background/50 border-t border-border/50 backdrop-blur-sm z-20">
                &copy; {new Date().getFullYear()} MyLB. Tous droits réservés. | 
                <Link to="/terms" className="hover:text-primary transition-colors ml-1 underline-offset-4 hover:underline">Conditions Générales</Link>
            </footer>

        </div>
    );
};

export default Signup;