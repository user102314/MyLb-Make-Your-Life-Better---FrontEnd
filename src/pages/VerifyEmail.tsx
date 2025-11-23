// src/pages/VerifyEmail.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// URL de base de votre API Spring Boot
const API_BASE_URL = 'http://localhost:9090/api/email';

const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();
    
    // État pour le code saisi par l'utilisateur
    const [verificationCode, setVerificationCode] = useState('');
    
    // Pour l'affichage de l'email de l'utilisateur connecté
    const [userEmail, setUserEmail] = useState('Chargement de l\'email...'); 
    
    // État pour les messages de statut (succès ou erreur)
    const [message, setMessage] = useState('Veuillez cliquer pour obtenir votre code.');
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
    const [isVerified, setIsVerified] = useState(false);

    // 💡 Récupération simulée de l'email de l'utilisateur connecté pour l'affichage
    useEffect(() => {
        // En supposant que vous stockez l'email de l'utilisateur après la connexion
        const emailFromStorage = localStorage.getItem('user_connected_email'); 
        if (emailFromStorage) {
             setUserEmail(emailFromStorage);
        } else {
             // Affichage d'un placeholder si l'email n'est pas trouvé
             setUserEmail('Non spécifié (veuillez vous connecter)');
        }
    }, []);

    // Redirection automatique après succès
    useEffect(() => {
        if (isVerified) {
            const timer = setTimeout(() => {
                navigate('/dashboard/verify');
            }, 3000); // Redirection après 3 secondes
            
            return () => clearTimeout(timer);
        }
    }, [isVerified, navigate]);

    // Fonction pour consommer l'API d'envoi de code
    const handleSendCode = async () => {
        setMessage('Envoi du code en cours...');
        setIsSuccess(null);

        try {
            const response = await fetch(`${API_BASE_URL}/send-verification-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // 🚨 AJOUT CRITIQUE: Inclure les cookies de session pour l'authentification
                credentials: 'include', 
                // Le corps est vide, car le back-end utilise la session pour l'ID/Email.
            });

            const data = await response.json();

            if (response.ok) {
                // Met à jour le message d'envoi avec l'email affiché
                setMessage(data.message || `Code envoyé avec succès ! Vérifiez l'adresse : ${userEmail}`);
                setIsSuccess(true);
            } else {
                // Affichage du message d'erreur du back-end (y compris 'USER_ID manquant')
                setMessage(data.error || 'Erreur lors de l\'envoi du code. Le serveur a refusé la requête.');
                setIsSuccess(false);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            setMessage('Erreur de connexion au serveur. Assurez-vous que le back-end est lancé.');
            setIsSuccess(false);
        }
    };

    // Fonction pour consommer l'API de vérification de code
    const handleVerifyCode = async () => {
        if (verificationCode.length !== 6) {
            setMessage('Le code de vérification doit comporter 6 chiffres.');
            setIsSuccess(false);
            return;
        }

        setMessage('Vérification du code en cours...');
        setIsSuccess(null);

        try {
            const response = await fetch(`${API_BASE_URL}/verify-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // 🚨 AJOUT CRITIQUE: Inclure les cookies de session pour l'authentification
                credentials: 'include',
                body: JSON.stringify({ code: verificationCode }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage(data.message || 'Félicitations, votre email est vérifié ! Redirection dans 3 secondes...');
                setIsSuccess(true);
                setIsVerified(true);
                
                // Réinitialiser le champ de code
                setVerificationCode('');
            } else {
                setMessage(data.message || 'Code invalide ou expiré. Veuillez réessayer.');
                setIsSuccess(false);
                setIsVerified(false);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            setMessage('Erreur de connexion au serveur lors de la vérification.');
            setIsSuccess(false);
            setIsVerified(false);
        }
    };

    // Style de message dynamique
    const messageClasses = isSuccess === true 
        ? "bg-green-100 border-green-400 text-green-700"
        : isSuccess === false 
        ? "bg-red-100 border-red-400 text-red-700"
        : "bg-yellow-50 border-yellow-300 text-yellow-800";

    return (
        <div className="w-full max-w-2xl mx-auto p-4 pt-8">
            <Link to="/dashboard/verify" className="flex items-center text-blue-600 hover:underline mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux étapes
            </Link>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-600/20">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Vérification de l'Email ✉️</h1>
                <p className="text-gray-600 mb-6">
                    Pour finaliser votre compte, veuillez confirmer l'adresse : <strong className="text-gray-900">{userEmail}</strong>
                </p>

                {/* Section d'envoi de code */}
                <div className="mb-6">
                    <button
                        onClick={handleSendCode}
                        className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150"
                        disabled={isVerified}
                    >
                        {isVerified ? 'Email Vérifié ✓' : 'Obtenir un Code de Vérification'}
                    </button>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                        {isVerified ? 'Votre email a été vérifié avec succès !' : 'Cliquez ci-dessus pour recevoir votre code par email.'}
                    </p>
                </div>
                
                {/* Section de vérification de code */}
                {!isVerified && (
                    <div className="flex flex-col space-y-4">
                        <label htmlFor="code" className="text-lg font-medium text-gray-700">
                            Entrez le Code Reçu (6 chiffres) :
                        </label>
                        <input
                            id="code"
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} // N'autorise que les chiffres
                            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center text-xl tracking-widest"
                            placeholder="______"
                            disabled={isVerified}
                        />
                        <button
                            onClick={handleVerifyCode}
                            className="w-full py-3 px-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 disabled:bg-gray-400"
                            disabled={verificationCode.length !== 6 || isVerified}
                        >
                            {isVerified ? 'Vérifié ✓' : 'Vérifier le Code'}
                        </button>
                    </div>
                )}

                {/* Affichage du Statut */}
                {message && (
                    <div className={`mt-6 p-4 rounded-md text-sm border ${messageClasses}`}>
                        {message}
                        {isVerified && (
                            <div className="mt-2 text-sm">
                                <p>✅ Redirection automatique vers la page de vérification...</p>
                                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                    <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bouton de retour manuel si l'utilisateur ne veut pas attendre */}
                {isVerified && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/dashboard/verify')}
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                            Retourner maintenant à la page de vérification
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;