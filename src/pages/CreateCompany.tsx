import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ArrowRight, Save, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

// Définition de l'interface des données de la requête
interface CompanyRegistrationRequest {
    companyName: string;
}

// Interface pour la réponse attendue de l'API
interface CompanyResponse {
    companyId: number;
    companyName: string;
    ownerID: number;
    dateInscri: string;
    status: string;
}

const CreateCompany: React.FC = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (companyName.trim().length < 3) {
            setError("Le nom de la société doit contenir au moins 3 caractères.");
            return;
        }

        setIsLoading(true);

        const requestBody: CompanyRegistrationRequest = {
            companyName: companyName.trim(),
        };
        
        try {
            // MODIFICATION ICI : UTILISATION DE L'URL ABSOLUE (Port 9090)
            const response = await fetch('http://localhost:9090/api/companies/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    // Note: Si vous utilisez des cookies de session, vous pourriez avoir besoin de 'credentials': 'include' ici
                },
                credentials: 'include',
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                let errorMessage = `Erreur (${response.status}) lors de l'enregistrement de la société.`;
                
                try {
                    // Tenter de lire le JSON pour obtenir un message d'erreur détaillé du backend
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.detail || errorMessage;

                } catch (e) {
                    // Si le corps n'est pas un JSON valide (erreur 404, 500, etc.), le message par défaut est utilisé.
                    console.error("Réponse non-JSON reçue, impossible de décoder l'erreur.");
                }

                throw new Error(errorMessage);
            }

            // Si la réponse est OK (200/201), nous décodons le JSON
            const newCompanyData: CompanyResponse = await response.json(); 
            
            setSuccess(true);
            setIsLoading(false);
            
            // Redirection vers l'étape suivante (validation/KYC) après un court délai
            setTimeout(() => {
                navigate(`/dashboard/CompanyValidation?companyId=${newCompanyData.companyId}`);
            }, 1500);

        } catch (err: any) {
            setError(err.message || "Une erreur inattendue est survenue.");
            setIsLoading(false);
        }
    };

    // --- Rendu ---
    
    return (
        <div className="w-full max-w-5xl mx-auto pt-6 pb-12">
            
            {/* HEADER */}
            <header className="mb-10 p-6 bg-card rounded-xl shadow-2xl border-l-4 border-primary">
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                    <Building className="w-7 h-7 text-primary" /> **Enregistrement de la Société**
                </h1>
                <p className="text-xl text-muted-foreground">
                    Première étape : Nommez votre société pour commencer le processus d'introduction en bourse.
                </p>
            </header>

            {/* FORMULAIRE D'ENREGISTREMENT */}
            <form onSubmit={handleFormSubmit} className="bg-card p-8 rounded-xl shadow-lg border border-border mb-8">
                
                <h2 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-2">
                    <Save className="w-5 h-5" /> Informations de Base
                </h2>
                
                {/* Champ Nom de la Société */}
                <div className="mb-6">
                    <label 
                        htmlFor="companyName" 
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        Nom Légal Complet de votre Société
                    </label>
                    <input
                        id="companyName"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: SARL Ma Nouvelle Entreprise"
                        required
                        disabled={isLoading || success}
                        className="w-full p-3 border border-border bg-input rounded-lg text-foreground focus:ring-primary focus:border-primary transition duration-150"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Ce nom sera utilisé pour l'enregistrement légal.
                    </p>
                </div>
                
                {/* Messages de Statut */}
                {error && (
                    <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-900/20 border border-red-600 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Erreur: {error}</span>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-900/20 border border-green-600 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Société enregistrée avec succès ! Redirection...</span>
                    </div>
                )}

                {/* Bouton de Soumission */}
                <button 
                    type="submit"
                    disabled={isLoading || success || companyName.trim().length < 3}
                    className={`py-3 px-8 rounded-lg font-bold transition-all duration-300 flex items-center gap-3 w-full justify-center text-white 
                        ${isLoading || success || companyName.trim().length < 3
                            ? 'bg-gray-700 cursor-not-allowed' 
                            : 'bg-primary shadow-lg hover:bg-primary/90'
                        }`
                    }
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> **Enregistrement en cours...**
                        </>
                    ) : (
                        <>
                            Enregistrer et Continuer 
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            {/* SECTION D'INFORMATION */}
            <div className="p-6 mt-8 bg-card rounded-xl shadow-lg border border-border">
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" /> **Prochaine Étape : Validation (KYC)**
                </h3>
                <p className="text-muted-foreground">
                    Après l'enregistrement de ce nom, le système attribuera l'**OwnerID** du client connecté et le statut **PENDING**. Vous serez ensuite redirigé pour soumettre les documents légaux.
                </p>
            </div>
        </div>
    );
};

export default CreateCompany;