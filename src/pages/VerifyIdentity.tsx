// src/pages/VerifyEmail.tsx

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Save, CheckCircle } from 'lucide-react'; 
import { Link } from 'react-router-dom';

// URL de base de votre API Spring Boot
const API_BASE_URL = 'http://localhost:9090'; 

const VerifyEmail: React.FC = () => {
    // États pour le flux
    const [kycAccepted, setKycAccepted] = useState(false); // Accepter les conditions
    const [kycSubmitted, setKycSubmitted] = useState(false); // Soumission réussie
    
    const [userEmail, setUserEmail] = useState('Chargement de l\'email...'); 
    
    // États pour les fichiers
    const [fileRecto, setFileRecto] = useState<File | null>(null);
    const [fileVerso, setFileVerso] = useState<File | null>(null);
    const [fileSelfie, setFileSelfie] = useState<File | null>(null);
    
    // Messages de statut
    const [message, setMessage] = useState('Veuillez accepter les conditions pour commencer la vérification d\'identité.');
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

    // Références pour les inputs de fichiers (pour déclencher le clic)
    const refRecto = useRef<HTMLInputElement>(null);
    const refVerso = useRef<HTMLInputElement>(null);
    const refSelfie = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const emailFromStorage = localStorage.getItem('user_connected_email'); 
        if (emailFromStorage) {
             setUserEmail(emailFromStorage);
        } else {
             setUserEmail('Non spécifié (veuillez vous connecter)');
        }
    }, []);

    // -------------------------------------------------------------------------
    // GESTION DE L'ENVOI DES DOCUMENTS (KYC)
    // -------------------------------------------------------------------------

    const handleSaveKyc = async () => {
        if (!fileRecto || !fileVerso || !fileSelfie) {
            setMessage('Veuillez fournir les trois documents requis.');
            setIsSuccess(false);
            return;
        }

        setMessage('Enregistrement des documents en cours...');
        setIsSuccess(null);

        const formData = new FormData();
        formData.append('cinRecto', fileRecto);
        formData.append('cinVerso', fileVerso);
        formData.append('selfie', fileSelfie);

        try {
            const response = await fetch(`${API_BASE_URL}/api/kyc/upload-documents`, {
                method: 'POST',
                body: formData, 
                // 🚨 CRITIQUE: Assure l'envoi du cookie JSESSIONID
                credentials: 'include', 
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage('Documents soumis avec succès. Merci de bien vouloir attendre la validation de notre équipe de support.');
                setIsSuccess(true);
                setKycSubmitted(true); 
            } else {
                setMessage(data.message || data.error || 'Erreur lors de la soumission des documents. Veuillez réessayer.');
                setIsSuccess(false);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            setMessage('Erreur de connexion au serveur lors de la soumission KYC.');
            setIsSuccess(false);
        }
    };
        
    // Style de message dynamique adapté au thème sombre
    const messageClasses = isSuccess === true 
        ? "bg-green-900 border-green-700 text-green-300"
        : isSuccess === false 
        ? "bg-red-900 border-red-700 text-red-300"
        : "bg-yellow-900 border-yellow-700 text-yellow-300";
        
    // Composant réutilisable pour le champ de fichier (Thème Sombre)
    const FileInput: React.FC<{ 
        label: string, 
        file: File | null, 
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        fileRef: React.RefObject<HTMLInputElement>
    }> = ({ label, file, setFile, fileRef }) => (
        <div className="flex flex-col space-y-2">
            <label className="text-lg font-medium text-gray-300">{label}</label>
            <input
                type="file"
                ref={fileRef}
                accept="image/*"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
            />
            <button
                onClick={() => fileRef.current?.click()}
                className={`flex items-center justify-center py-3 px-4 rounded-lg transition duration-150 ${
                    file 
                        ? 'bg-blue-900 border-2 border-blue-500 text-blue-300'
                        : 'bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
            >
                <Upload className="w-5 h-5 mr-2" />
                {file ? file.name : 'Choisir un fichier'}
            </button>
        </div>
    );


    return (
        <div className="w-full max-w-2xl mx-auto p-4 pt-8"> 
            
            <Link to="/dashboard" className="flex items-center text-blue-400 hover:text-blue-300 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au tableau de bord
            </Link>

            <div className="bg-gray-900 p-8 rounded-xl shadow-lg border border-blue-600/50">
                <h1 className="text-3xl font-bold text-white mb-4">Vérification d'Identité (KYC) 🆔</h1>
                <p className="text-gray-400 mb-6">
                    Compte utilisateur : <strong className="text-white">{userEmail}</strong>
                </p>

                {/* Affichage du Statut */}
                {message && (
                    <div className={`mb-6 p-4 rounded-md text-sm border ${messageClasses}`}>
                        {message}
                    </div>
                )}

                {/* --- LOGIQUE D'AFFICHAGE --- */}
                {kycSubmitted ? (
                    // --- ÉCRAN DE SUCCÈS ---
                    <div className="text-center p-10 bg-gray-800 rounded-lg">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-300 mb-3">Soumission Complétée !</h2>
                        <p className="text-lg text-gray-400">
                           Merci de bien vouloir **attendre la validation** de notre équipe de support.
                        </p>
                        <Link to="/dashboard" className="mt-6 inline-block py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                            Aller au Tableau de Bord
                        </Link>
                    </div>

                ) : (
                    // --- ÉCRAN D'ACCEPTATION / FORMULAIRE ---
                    <>
                        {!kycAccepted ? (
                            // Écran d'accueil/Acceptation
                            <div className="text-center">
                                 <p className="text-gray-400 mb-6">
                                    Veuillez accepter les termes pour soumettre les documents d'identification requis.
                                </p>
                                <button
                                    onClick={() => {
                                        setKycAccepted(true);
                                        setMessage('Veuillez télécharger vos documents d\'identité (Recto, Verso, Selfie).');
                                        setIsSuccess(null);
                                    }}
                                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
                                >
                                    J'accepte et je commence le KYC
                                </button>
                            </div>

                        ) : (
                            // Écran de Formulaire KYC
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2">Documents Requis</h2>
                                
                                <FileInput 
                                    label="1. Photo Recto CIN / Passeport" 
                                    file={fileRecto} 
                                    setFile={setFileRecto} 
                                    fileRef={refRecto}
                                />
                                <FileInput 
                                    label="2. Photo Verso CIN / Passeport (si applicable)" 
                                    file={fileVerso} 
                                    setFile={setFileVerso} 
                                    fileRef={refVerso}
                                />
                                <FileInput 
                                    label="3. Photo Selfie (vous tenant le document Recto)" 
                                    file={fileSelfie} 
                                    setFile={setFileSelfie} 
                                    fileRef={refSelfie}
                                />

                                <button
                                    onClick={handleSaveKyc}
                                    className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150 disabled:bg-gray-700 disabled:text-gray-400 flex items-center justify-center"
                                    disabled={!fileRecto || !fileVerso || !fileSelfie}
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    Enregistrer et Soumettre les Documents
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;