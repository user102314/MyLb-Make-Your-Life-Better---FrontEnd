// src/pages/Verify.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, BookOpen, Key, CheckCircle, XCircle, Shield, ArrowRight, User, Lock } from 'lucide-react';

// --- Interfaces ---

interface ClientData {
    firstName: string;
    lastName: string;
}

interface CheckVerification {
    etat1: boolean;
    etat2: boolean;
    etat3: boolean;
    etat4: boolean;
    iduser?: number;
    idverification?: number;
}

// --- Configuration ---

const initialVerificationStatus: CheckVerification = {
    etat1: false, etat2: false, etat3: false, etat4: false,
};

// CHANGEZ L'URL POUR UTILISER /api/auth/me AU LIEU DE /api/client/profile
const API_PROFILE_URL = "http://localhost:9090/api/auth/me"; 
const API_VERIFY_URL = "http://localhost:9090/api/check-verification"; 

const steps = [
    { id: 1, name: 'Vérifier votre Email', icon: Mail, path: '/dashboard/verifyemail' },
    { id: 2, name: 'Vérifier votre Identité (CIN/Passeport)', icon: BookOpen, path: '/dashboard/VerifyIdentity' },
    { id: 3, name: 'Activer l\'Authentification (Google Auth)', icon: Shield, path: '/dashboard/VerifyGoogleAuth' },
    { id: 4, name: "Générer la Clé de Récupération (2FA)", icon: Key, path: '/dashboard/RequestAccessKey' }
];

// --- Composant Principal ---

const Verify: React.FC = () => {
    const [userName, setUserName] = useState<string>('Utilisateur');
    const [verificationStatus, setVerificationStatus] = useState<CheckVerification>(initialVerificationStatus);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isFullyVerified = verificationStatus.etat1 && verificationStatus.etat2 && verificationStatus.etat3 && verificationStatus.etat4;
    
    const getStatusArray = (status: CheckVerification): boolean[] => {
        return [
            status.etat1,
            status.etat2,
            status.etat3,
            status.etat4,
        ].slice(0, steps.length);
    };
    
    const determineStepStatus = useCallback((stepId: number): 'Validated' | 'Next' | 'Blocked' => {
        if (!verificationStatus) return 'Blocked';

        const statusArray = getStatusArray(verificationStatus);
        const currentIndex = stepId - 1;

        if (currentIndex >= statusArray.length) return 'Blocked';

        if (statusArray[currentIndex] === true) {
            return 'Validated';
        }

        const nextStepIndex = statusArray.findIndex(status => status === false);
        
        if (currentIndex === nextStepIndex) {
            return 'Next';
        }
        
        return 'Blocked';
    }, [verificationStatus]);

    /**
     * Récupère les données du profil et le statut de vérification en parallèle.
     */
    const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Récupération du nom depuis /api/auth/me
            const profileResponse = await fetch(API_PROFILE_URL, { 
                method: 'GET', 
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            // Récupération du statut de vérification
            const statusResponse = await fetch(`${API_VERIFY_URL}/status`, { 
                method: 'GET', 
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // 1. Traitement de la réponse du profil
            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                
                // Vérifiez la structure de la réponse de votre API
                if (profileData.firstName) {
                    // Si votre API retourne seulement le firstName
                    setUserName(profileData.firstName);
                } else {
                    console.warn("[API FETCH] Structure de données de profil inattendue:", profileData);
                    setUserName('Utilisateur');
                }
            } else {
                console.error(`[API FETCH] Erreur chargement profil: ${profileResponse.status}`);
                if (profileResponse.status === 401) {
                    setError("Session expirée. Veuillez vous reconnecter.");
                }
            }

            // 2. Traitement de la réponse du statut de vérification
            if (statusResponse.ok) {
                const statusData: CheckVerification = await statusResponse.json();
                if (statusData && typeof statusData.etat1 === 'boolean') {
                   setVerificationStatus(statusData);
                } else {
                   console.warn("[API FETCH] Données de vérification invalides. Utilisation de l'état par défaut.");
                }
            } else {
                console.error(`[API FETCH] Erreur chargement statut: ${statusResponse.status}`);
            }
            
        } catch (err) {
            console.error("[API FETCH] Erreur de connexion critique:", err);
            setError("Erreur de connexion au serveur (réseau/CORS).");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []); 

    // --- Rendu des États (Loading / Erreur) ---

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 min-h-[500px] bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Préparation du vérificateur de profil...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
                <header className="mb-10 p-6 bg-red-800/20 border-l-4 border-red-500 rounded-xl shadow-lg text-red-500">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <XCircle className="w-6 h-6" /> Erreur de chargement des données
                    </h1>
                    <p className="text-lg mt-2">{error}</p>
                </header>
            </div>
        );
    }
    
    // --- Rendu du Stepper ---

    return (
        <div className="w-full max-w-4xl mx-auto pt-6 pb-12">
            
            {/* HEADER (Thème Sombre) */}
            <div className="mb-10 p-6 bg-card rounded-xl shadow-2xl border-l-4 border-primary">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    👋 Bonjour {userName},
                </h1>
                <p className="text-xl text-muted-foreground">
                    Complétez votre <strong className="text-primary">processus de vérification</strong>.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Plus de vérifications = plus de sécurité et des limites plus élevées.
                </p>
            </div>

            {/* MESSAGE SUCCÈS GLOBAL */}
            {isFullyVerified && (
                <div className="mb-10 p-6 bg-green-900/40 border-l-4 border-green-500 rounded-xl shadow-lg text-center text-green-200">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-green-500">
                        Profil 100% Vérifié ! 🎉
                    </h2>
                    <p className="text-lg mt-2">
                        Félicitations, toutes vos étapes de vérification sont complètes.
                    </p>
                </div>
            )}

            {/* BODY : Étapes (Thème Sombre) */}
            <div className="bg-card p-8 rounded-xl shadow-2xl border border-border">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">
                    {isFullyVerified ? 'Statut des étapes' : 'Étapes à suivre :'}
                </h2>
                
                <div className="space-y-4">
                    {steps.map((step) => {
                        const status = determineStepStatus(step.id);
                        const Icon = step.icon;

                        let itemClasses = "";
                        let ActionIcon: any = Icon; 
                        let isEnabled = false;
                        let statusText = "";

                        switch (status) {
                            case 'Validated':
                                itemClasses = "bg-green-800/20 text-green-400 border-green-700/50 shadow-inner";
                                ActionIcon = CheckCircle;
                                statusText = "Validée";
                                isEnabled = false; 
                                break;
                            case 'Next':
                                itemClasses = "bg-primary text-primary-foreground shadow-xl cursor-pointer hover:bg-primary/90 transition duration-200";
                                ActionIcon = Icon;
                                statusText = "Commencer";
                                isEnabled = true; 
                                break;
                            case 'Blocked':
                            default:
                                itemClasses = "bg-muted/50 text-muted-foreground border-border cursor-not-allowed opacity-70";
                                ActionIcon = Lock;
                                statusText = "Bloquée";
                                isEnabled = false; 
                                break;
                        }
                        
                        const StepComponent = isEnabled ? Link : 'div';
                        const linkProps = isEnabled ? { to: step.path } : {};

                        return (
                            <StepComponent
                                key={step.id}
                                className={`flex items-center p-4 rounded-xl border-2 ${itemClasses}`}
                                {...linkProps}
                            >
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-4">
                                    <ActionIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-grow">
                                    <span className={`text-sm font-medium ${status === 'Next' ? 'text-primary-foreground/70' : ''}`}>Étape {step.id} :</span>
                                    <p className="text-lg font-bold">{step.name}</p>
                                </div>
                                <div className="ml-4 font-semibold text-sm flex items-center gap-2">
                                    {status === 'Next' && <ArrowRight className="w-4 h-4" />}
                                    {statusText}
                                </div>
                            </StepComponent>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Verify;