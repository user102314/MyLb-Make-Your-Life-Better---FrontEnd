// src/pages/RequestAccessKey.tsx

import React, { useState } from 'react';
import { Loader2, Send, Clock, Key, AlertTriangle, ArrowLeft } from 'lucide-react'; // 👈 AJOUT d'ArrowLeft
import { useNavigate } from 'react-router-dom'; // 👈 AJOUT CRUCIAL pour la navigation

const API_URL = 'http://localhost:9090/api/access-key/request'; 

type Status = 'initial' | 'sending' | 'success' | 'error';

const RequestAccessKey: React.FC = () => {
    const [status, setStatus] = useState<Status>('initial');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // 👈 Initialisation du hook de navigation
    let response: Response; 

    // Fonction pour naviguer vers la page de vérification ou le tableau de bord
    const handleGoBack = () => {
        // Remplacez '/verify' par la route réelle de votre page de vérification ou de votre tableau de bord
        navigate('/verify'); 
    };

    const handleRequestAccess = async () => {
        if (status === 'sending') return;
        
        setStatus('sending');
        setMessage('');

        try {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // 🚨 Essentiel pour envoyer le cookie de session JSESSIONID
            });

            if (!response.ok) {
                const errorText = await response.text(); 
                
                if (response.status === 401) {
                    setMessage(`Erreur 401: Non autorisé. ${errorText || "Veuillez vous reconnecter."}`);
                } else {
                    setMessage(errorText || `Échec de la soumission (Code: ${response.status})`);
                }
                
                throw new Error(errorText); 
            }

            // Succès : Récupère le message du Back-end
            const successMessage = await response.text();
            setStatus('success');
            setMessage(successMessage);
            
        } catch (error: any) {
            console.error("Échec de la demande de clé d'accès:", error);
            
            if (status !== 'success') {
                 setStatus('error');
                 if (!message) { 
                     setMessage('Erreur de connexion au serveur ou Back-end non disponible.');
                 }
            }
        }
    };
    
    const isWaiting = status === 'success';

    return (
        <div className="w-full max-w-xl mx-auto p-4 md:p-8 text-center bg-white rounded-xl shadow-lg">
            
            {/* 👈 AJOUT DU BOUTON/LIEN DE RETOUR */}
            <div className="text-left mb-4">
                <button 
                    onClick={handleGoBack}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retourner à la Vérification
                </button>
            </div>
            {/* ------------------------------------- */}
            
            <header className="mb-8">
                <Key className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h1 className="text-3xl font-bold text-gray-900">Étape 4 : Demande de Clé d'Accès</h1>
                <p className="text-gray-600 mt-2">Finalisez le processus en demandant la révision de votre dossier.</p>
            </header>

            {/* --- AFFICHAGE DES MESSAGES (SUCCÈS / ERREUR) --- */}
            {isWaiting && (
                <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <Clock className="w-10 h-10 text-yellow-600 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-semibold text-yellow-800 mb-3">Dossier en Cours de Révision</h3>
                    <p className="text-yellow-700 font-medium leading-relaxed">{message}</p>
                </div>
            )}
            
            {status === 'error' && (
                <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-2 mt-0.5" />
                    <p className="text-left font-medium">{message}</p>
                </div>
            )}
            
            {/* --- BOUTON DE SOUMISSION --- */}
            {status !== 'success' && (
                <button
                    onClick={handleRequestAccess}
                    disabled={status === 'sending'}
                    className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition disabled:bg-indigo-400 flex items-center justify-center"
                >
                    {status === 'sending' ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        <Send className="w-5 h-5 mr-2" />
                    )}
                    {status === 'sending' ? 'Soumission en cours...' : 'Soumettre le Dossier et Demander la Clé'}
                </button>
            )}
        </div>
    );
};

export default RequestAccessKey;