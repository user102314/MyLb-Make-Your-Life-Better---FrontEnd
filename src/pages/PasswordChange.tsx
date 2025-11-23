import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { KeyRound, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';

// URL de l'API de modification de mot de passe (doit accepter le JSON avec le code 2FA)
const API_PASSWORD_CHANGE_URL = "http://localhost:9090/api/password/change";

// Interface pour les messages d'état
interface StatusMessage {
    type: 'success' | 'error' | null;
    text: string | null;
}

const PasswordChange: React.FC = () => {
    // --- États du Formulaire ---
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [authCode, setAuthCode] = useState(''); // Code 2FA

    // --- États de l'Application ---
    const [step, setStep] = useState(1); // 1: Mots de passe, 2: Code 2FA
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<StatusMessage>({ type: null, text: null });

    // Règle de sécurité du mot de passe (à synchroniser avec le backend)
    const isPasswordSecure = (password: string): boolean => {
        return password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password) && 
               /[0-9]/.test(password) && 
               /[^a-zA-Z0-9\s]/.test(password);
    };

    // Validation du formulaire de l'Étape 1
    const isStepOneValid = 
        currentPassword.length > 0 && 
        isPasswordSecure(newPassword) && 
        newPassword === confirmNewPassword;
        
    // ----------------------------------------------------------------------
    // 1. GESTION DU PASSAGE À L'ÉTAPE 2 (Validation front-end)
    // ----------------------------------------------------------------------

    const handleStepOneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: null, text: null });

        if (!isStepOneValid) {
            setStatus({ type: 'error', text: 'Veuillez vérifier le mot de passe actuel et vous assurer que le nouveau mot de passe est sécurisé et confirmé.' });
            return;
        }

        // Si la validation front-end réussit, passer à l'étape 2 (demande 2FA)
        setStep(2);
    };
    
    // ----------------------------------------------------------------------
    // 2. SOUMISSION FINALE AVEC 2FA (Appel API)
    // ----------------------------------------------------------------------

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: null, text: null });

        // Vérification front-end du code 2FA
        if (authCode.length !== 6 || !/^\d+$/.test(authCode)) {
            setStatus({ type: 'error', text: 'Veuillez entrer un code Google Authenticator valide (6 chiffres).' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(API_PASSWORD_CHANGE_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                body: JSON.stringify({ 
                    currentPassword: currentPassword, 
                    newPassword: newPassword,
                    authCode: authCode // 🔑 Code 2FA inclus dans la requête
                }),
            });
            
            // Le backend renvoie 'true' si la modification réussit, ou une erreur.
            if (response.ok) {
                // Si le backend renvoie un statut 200/204 et que l'opération a réussi
                setStatus({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
                // Réinitialisation après succès
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setAuthCode('');
                setStep(1); // Retour à l'étape initiale
            } else {
                // GESTION DES ERREURS BACKEND (Ancien mot de passe, Code 2FA invalide, etc.)
                const errorBody = await response.text();
                
                let userError = 'Une erreur inattendue est survenue.';
                
                if (response.status === 401 || response.status === 403) {
                    // C'est souvent ici que le backend renverra les erreurs de sécurité
                    if (errorBody.includes("Code Google Authenticator invalide")) {
                        userError = "Code Google Authenticator incorrect ou expiré. Réessayez.";
                        setAuthCode(''); // Effacer le code pour réessayer
                    } else if (errorBody.includes("Ancien mot de passe incorrect")) {
                        userError = "L'ancien mot de passe fourni est incorrect.";
                        setStep(1); // Retour à l'étape 1 pour correction
                    } else if (errorBody.includes("Authentification à deux facteurs requise")) {
                        userError = "Authentification à deux facteurs requise, mais code manquant.";
                    } else {
                        userError = `Action non autorisée. ${errorBody.slice(0, 50)}...`;
                    }
                } else if (response.status === 500) {
                    userError = "Erreur interne du serveur. Veuillez réessayer plus tard.";
                } else {
                    userError = `Échec de la mise à jour : ${errorBody}`;
                }
                                 
                setStatus({ type: 'error', text: userError });
                // Rester à l'étape 2 si l'erreur concerne le code 2FA
            }
        } catch (error) {
            console.error("Erreur réseau ou du serveur:", error);
            setStatus({ type: 'error', text: 'Impossible de contacter le serveur (Network/CORS). 💔' });
        } finally {
            setLoading(false);
        }
    };

    // ... (Le reste des fonctions StatusDisplay, renderStepOne, renderStepTwo est inchangé)

    // ----------------------------------------------------------------------
    // 3. AFFICHAGE DES MESSAGES D'ÉTAT
    // ----------------------------------------------------------------------

    const StatusDisplay = () => {
        if (!status.type || !status.text) return null;

        const baseClass = "p-3 rounded-lg flex items-center gap-2 mt-4 font-medium";
        const successClass = "bg-green-100 text-green-700 border border-green-300";
        const errorClass = "bg-red-100 text-red-700 border border-red-300";

        const Icon = status.type === 'success' ? CheckCircle : XCircle;
        const className = status.type === 'success' ? successClass : errorClass;

        return (
            <div className={`${baseClass} ${className}`}>
                <Icon className="w-5 h-5" />
                {status.text}
            </div>
        );
    };

    // ----------------------------------------------------------------------
    // 4. RENDU DES ÉTAPES
    // ----------------------------------------------------------------------

    const renderStepOne = () => (
        <form onSubmit={handleStepOneSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-primary/80">Étape 1/2 : Saisie des Mots de Passe</h3>

            <div className="space-y-2">
                <Label htmlFor="current-password">Mot de Passe Actuel</Label>
                <Input
                    id="current-password"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau Mot de Passe (8+ car., Maj/Min, Chiffre, Spécial)</Label>
                <Input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le Nouveau Mot de Passe</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={loading}
                />
                {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                    <p className="text-sm text-red-500">Les mots de passe ne correspondent pas.</p>
                )}
            </div>
            
            <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white transition-colors"
                disabled={!isStepOneValid || loading}
            >
                Continuer (Vérification 2FA)
            </Button>
        </form>
    );

    const renderStepTwo = () => (
        <form onSubmit={handleFinalSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-primary/80 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Étape 2/2 : Double Authentification (2FA)
            </h3>
            
            <p className="text-sm text-muted-foreground">
                Pour des raisons de sécurité, veuillez entrer le code à 6 chiffres généré par votre application Google Authenticator.
            </p>

            <div className="space-y-2">
                <Label htmlFor="auth-code">Code Google Authenticator</Label>
                <Input
                    id="auth-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    disabled={loading}
                    className="text-center text-xl tracking-widest"
                />
            </div>
            
            <div className="flex gap-4">
                <Button 
                    type="button"
                    variant="outline"
                    onClick={() => { setStep(1); setStatus({ type: null, text: null }); }}
                    disabled={loading}
                    className="w-1/3"
                >
                    Retour
                </Button>
                <Button 
                    type="submit" 
                    className="w-2/3 bg-green-600 hover:bg-green-700 text-white transition-colors"
                    disabled={loading || authCode.length !== 6}
                >
                    {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Modification...</>
                    ) : (
                        "Modifier le Mot de Passe"
                    )}
                </Button>
            </div>
        </form>
    );

    return (
        <div className="max-w-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <Card className="shadow-2xl border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <KeyRound className="w-6 h-6 text-primary" /> Modification Sécurisée
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {/* Affichage du Statut */}
                    <StatusDisplay />
                    
                    {/* Rendu du formulaire en fonction de l'étape */}
                    {step === 1 ? renderStepOne() : renderStepTwo()}
                </CardContent>
            </Card>
        </div>
    );
};

export default PasswordChange;