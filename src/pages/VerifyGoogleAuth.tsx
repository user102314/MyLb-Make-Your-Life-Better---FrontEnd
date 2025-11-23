// src/pages/VerifyGoogleAuth.tsx

import React, { useState } from 'react';
import QRCode from 'qrcode.react'; 
import { Loader2, QrCode, ShieldCheck, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 🚨 CIBLE DIRECTE DU BACK-END SUR LE PORT 9090
const API_BASE_URL = "http://localhost:9090/api/auth/google"; 

interface QrData {
    qrCodeUrl: string;
    secret: string;
}

const VerifyGoogleAuth: React.FC = () => {
    const [qrData, setQrData] = useState<QrData | null>(null);
    const [totpCode, setTotpCode] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    
    const navigate = useNavigate();

    // Redirection automatique après succès
    React.useEffect(() => {
        if (isVerified) {
            const timer = setTimeout(() => {
                navigate('/dashboard/verify');
            }, 3000); // Redirection après 3 secondes
            
            return () => clearTimeout(timer);
        }
    }, [isVerified, navigate]);

    // Fonction d'aide pour lire la réponse du serveur
    const getErrorJson = async (response: Response) => {
        try {
            return await response.json();
        } catch (e) {
            return { message: `Erreur ${response.status}: Réponse du serveur invalide ou vide. Vérifiez la console Spring Boot.` };
        }
    };

    // ----------------------------------------------------
    // Étape 1 : Récupération du QR Code et de la clé secrète
    // ----------------------------------------------------
    const handleGenerateQr = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/generate-qr`, { 
                method: 'POST',
                credentials: 'include',
            });
            
            if (!response.ok) {
                const errorData = await getErrorJson(response);
                setMessage(`Erreur: ${errorData.message}`);
                setIsLoading(false);
                return;
            }
            
            const data = await response.json();
            
            if (data.qrCodeUrl) {
                setQrData({ qrCodeUrl: data.qrCodeUrl, secret: data.secret });
                setMessage(data.message || "Scannez ce QR Code avec votre application d'authentification.");
            } else {
                 setMessage(`Erreur: ${data.message || "Échec de la récupération du QR Code."}`);
            }
        } catch (error) {
            console.error("Erreur réseau génération QR:", error);
            setMessage("Erreur réseau : impossible de joindre le serveur pour le 2FA. (Vérifiez le port 9090 et le CORS)");
        } finally {
            setIsLoading(false);
        }
    };

    // ----------------------------------------------------
    // Étape 2 : Validation du code TOTP
    // ----------------------------------------------------
    const handleSubmitValidation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (totpCode.length !== 6) {
            setMessage("Le code doit être composé de 6 chiffres.");
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/validate-totp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code: totpCode }),
            });

            if (!response.ok) {
                 const errorData = await getErrorJson(response);
                 setMessage(`Échec de la validation: ${errorData.message}`);
                 setIsLoading(false);
                 return;
            }

            const data = await response.json();

            if (data.success) {
                setMessage("✅ Authentification réussie ! Redirection vers la page de vérification dans 3 secondes...");
                setIsVerified(true);
            } else {
                 setMessage(`Échec de la validation: ${data.message || "Code invalide."}`);
            }
        } catch (error) {
            console.error("Erreur réseau validation TOTP:", error);
            setMessage("Erreur réseau lors de la validation du code.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fonction pour naviguer immédiatement vers la page de vérification
    const handleNavigateToVerify = () => {
        navigate('/dashboard/verify');
    };

    return (
        <div className="w-full max-w-xl mx-auto p-4 md:p-8">
            <header className="mb-8 text-center">
                <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h1 className="text-3xl font-bold text-gray-900">Vérification Google Authenticator (2FA)</h1>
                <p className="text-gray-600 mt-2">Activez l'étape 3 pour une sécurité maximale de votre compte.</p>
            </header>

            {/* MESSAGE D'ÉTAT */}
            {message && (
                <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                    isVerified ? 'bg-green-100 text-green-700 border border-green-300' : 
                    message.includes('Erreur') || message.includes('Échec') ? 'bg-red-100 text-red-700 border border-red-300' : 
                    'bg-blue-100 text-blue-700 border border-blue-300'
                }`}>
                    {message}
                </div>
            )}
            
            {/* BOUTON DE GÉNÉRATION SI PAS DE QR CODE */}
            {!qrData && !isVerified && (
                <div className="text-center">
                    <button
                        onClick={handleGenerateQr}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 flex items-center justify-center mx-auto"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <QrCode className="w-5 h-5 mr-2" />
                        )}
                        {isLoading ? 'Génération en cours...' : 'Générer le QR Code 2FA'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Ceci enregistrera votre clé secrète unique.</p>
                </div>
            )}
            
            {/* AFFICHE LE QR CODE ET LA ZONE DE SAISIE */}
            {qrData && !isVerified && (
                <div className="mt-6 p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-center">1. Scannez pour Enrôlement</h2>
                    
                    <div className="flex justify-center mb-6">
                        <div className="p-2 border border-gray-300">
                            <QRCode value={qrData.qrCodeUrl} size={200} level="H" includeMargin={false} />
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4 text-center">
                        Ouvrez Google Authenticator (ou Authy) et scannez le code ci-dessus.
                    </p>
                    <p className="text-xs text-gray-500 mb-6 text-center break-all">
                        Clé manuelle : <strong className="font-mono text-gray-800">{qrData.secret}</strong>
                    </p>

                    <h2 className="text-xl font-semibold mb-4 text-center border-t pt-4">2. Entrez le Code de Vérification</h2>
                    
                    <form onSubmit={handleSubmitValidation} className="space-y-4">
                        <input
                            type="text"
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Entrez le code à 6 chiffres"
                            maxLength={6}
                            className="w-full p-3 border border-gray-300 rounded-md text-center text-2xl tracking-widest font-mono focus:ring-blue-500 focus:border-blue-500"
                            required
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || totpCode.length !== 6}
                            className="w-full p-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition disabled:bg-gray-400 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="w-5 h-5 mr-2" />
                            )}
                            Valider et Activer 2FA
                        </button>
                    </form>
                </div>
            )}
            
            {/* MESSAGE DE SUCCÈS FINAL AVEC REDIRECTION AUTOMATIQUE */}
             {isVerified && (
                 <div className="text-center mt-6 p-8 bg-green-50 rounded-xl border border-green-300 shadow-xl">
                     <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                     <h3 className="text-2xl font-bold text-green-800">Félicitations !</h3>
                     <p className="text-lg text-green-700 mt-2">Votre authentification à deux facteurs est activée.</p>
                     
                     {/* Barre de progression pour la redirection */}
                     <div className="w-full bg-green-200 rounded-full h-2 mt-4 mb-4">
                         <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
                     </div>
                     
                     <p className="text-sm text-gray-500 mb-4">
                         Redirection automatique vers la page de vérification...
                     </p>
                     
                     {/* Bouton de retour manuel */}
                     <button 
                         onClick={handleNavigateToVerify}
                         className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                     >
                         Retourner maintenant aux étapes
                     </button>
                 </div>
             )}
        </div>
    );
};

export default VerifyGoogleAuth;