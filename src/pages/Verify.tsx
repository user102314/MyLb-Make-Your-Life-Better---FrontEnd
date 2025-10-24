// src/pages/Verify.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, Phone, BookOpen, Key, Users } from 'lucide-react';

// --- INTERFACE DE DONNÉES MINIMALES ---
interface ClientData {
    firstName: string;
    // Ajout d'autres propriétés si nécessaire, mais seul firstName est utilisé ici
}
interface ApiResponse {
    client: ClientData;
}
// ------------------------------------

const API_BASE_URL = "http://localhost:9090/api/client"; 

// Définition des étapes
const steps = [
    // CORRECTION APPLIQUÉE : Chemin absolu vers la route définie dans App.tsx
    { id: 1, name: 'Vérifier votre Email', icon: Mail, path: '/dashboard/verifyemail' },
    // Les autres chemins sont laissés tels que définis, mais le format absolu est recommandé
    { id: 2, name: 'Vérifier votre numéro de téléphone', icon: Phone, path: '/dashboard/verify/phone' },
    { id: 3, name: 'Vérifier avec CIN / Passeport', icon: BookOpen, path: '/dashboard/VerifyIdentity' },
    { id: 4, name: "Ajouter la clé d'accès", icon: Key, path: '/dashboard/verify/key' },
    { id: 5, name: 'Vérifier votre rôle', icon: Users, path: '/dashboard/verify/role' },
];

const Verify: React.FC = () => {
    const [userName, setUserName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Consommation de l'API pour obtenir le nom d'utilisateur
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/me`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error("Échec du chargement des données du profil.");
                }

                const apiResponse: ApiResponse = await response.json();
                setUserName(apiResponse.client.firstName);
            } catch (err) {
                console.error("Fetch error:", err);
                // Utiliser un nom par défaut si l'API échoue
                setUserName('Utilisateur'); 
                setError("Impossible de charger les données du profil.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserName();
    }, []);

    // Affichage des états de chargement/erreur
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20 min-h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Préparation du vérificateur...</p>
            </div>
        );
    }
    
    // --- Rendu du composant Stepper ---
    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            {/* HEADER */}
            <header className="mb-10 p-6 bg-white rounded-xl shadow-lg border-l-4 border-primary">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    👋 Bonjour {userName}{error ? ' (Erreur API)' : ''},
                </h1>
                <p className="text-xl text-gray-700">
                    Vous souhaitez <strong className="text-primary">compléter votre profil</strong> ?
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    Suivez les étapes ci-dessous pour débloquer toutes les fonctionnalités.
                </p>
            </header>

            {/* BODY : Étapes */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Voici les étapes à suivre :
                </h2>
                
                <div className="space-y-4">
                    {steps.map((step, index) => {
                        // Seule la première étape est active par défaut
                        const isEnabled = index === 2; 
                        
                        const itemClasses = isEnabled
                            ? "bg-primary text-white shadow-lg cursor-pointer hover:bg-primary/90 transition duration-200"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed";

                        const Icon = step.icon;
                        
                        // Si c'est la première étape active, elle est cliquable (Link)
                        const StepComponent = isEnabled ? Link : 'div';
                        const linkProps = isEnabled ? { to: step.path } : {};

                        return (
                            <StepComponent
                                key={step.id}
                                className={`flex items-center p-4 rounded-lg border-2 ${itemClasses}`}
                                {...linkProps}
                            >
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-4">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-sm font-medium">Étape {step.id} :</span>
                                    <p className="text-lg font-bold">{step.name}</p>
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