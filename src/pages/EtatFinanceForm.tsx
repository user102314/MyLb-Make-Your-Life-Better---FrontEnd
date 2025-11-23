import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    DollarSign, BookOpen, TrendingUp, FileText, Save, 
    Loader2, AlertTriangle, CheckCircle, Wallet 
} from 'lucide-react';

// Interface pour les données numériques (tous les champs sont des CHAÎNES pour la saisie confortable)
interface FinancialDataState {
    actifTotal: string; 
    actifImmobilise: string;
    actifCirculant: string;
    passifTotal: string;
    capitauxPropres: string;
    dettes: string;

    produitsTotal: string;
    chargesTotal: string;
    resultatNet: string;
    chiffreAffaires: string;

    fluxOperationnels: string;
    fluxInvestissement: string;
    fluxFinancement: string;
    variationNetteTresorerie: string;
}

// Type pour les clés numériques (utilisé pour l'itération)
type NumericKeys = keyof FinancialDataState;

const NUMERIC_KEYS: NumericKeys[] = [
    'actifTotal', 'actifImmobilise', 'actifCirculant', 'passifTotal', 'capitauxPropres', 'dettes',
    'produitsTotal', 'chargesTotal', 'resultatNet', 'chiffreAffaires',
    'fluxOperationnels', 'fluxInvestissement', 'fluxFinancement', 'variationNetteTresorerie',
];

const API_BASE_URL = 'http://localhost:9090';

// Composant Enfant Stabilité: n'accepte que les props nécessaires et utilise React.memo
const StableInput = React.memo<{ 
    id: NumericKeys; 
    label: string; 
    description: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
}>(({ id, label, description, value, onChange, disabled }) => {
    
    return (
        <div className="mb-4">
            <label htmlFor={id as string} className="block text-sm font-medium text-foreground mb-1">{label} (DA) *</label>
            <input 
                id={id as string} 
                type="text" 
                inputMode="decimal" 
                value={value} 
                onChange={onChange}
                required 
                disabled={disabled} 
                placeholder={description}
                className="w-full p-3 border border-border bg-input rounded-lg text-foreground focus:ring-primary focus:border-primary placeholder:text-muted-foreground/70" 
            />
        </div>
    );
});
StableInput.displayName = 'StableInput';


const EtatFinanceForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    
    const urlCompanyId = searchParams.get('companyId');
    const companyId = urlCompanyId ? parseInt(urlCompanyId) : null;

    // ÉTAT INITIAL : Généré une seule fois au montage
    const initialState: FinancialDataState = useMemo(() => 
        Object.fromEntries(NUMERIC_KEYS.map(key => [key, ''])) as FinancialDataState
    , []);

    // ÉTAT PRINCIPAL (tous string)
    const [formData, setFormData] = useState<FinancialDataState>(initialState);

    // États secondaires
    const [rapportFile, setRapportFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isFetchingInitialData, setIsFetchingInitialData] = useState(false);

    // Vérification initiale de l'ID
    useEffect(() => {
        if (!companyId || isNaN(companyId)) {
            setError("Erreur: ID de société non valide ou manquant dans l'URL.");
        }

        // Ajout de la logique de récupération des données existantes (pour la mise à jour)
        const fetchInitialData = async () => {
            setIsFetchingInitialData(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/company/finance/${companyId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.status === 404) {
                    // C'est une nouvelle soumission, pas d'erreur
                    setIsFetchingInitialData(false);
                    return;
                }
                
                if (!response.ok) {
                    throw new Error(`Erreur lors de la récupération des données (${response.status}).`);
                }

                const data = await response.json();
                
                // Mappage de l'entité reçue (number) vers l'état du formulaire (string)
                const mappedData: FinancialDataState = Object.fromEntries(
                    NUMERIC_KEYS.map(key => [key, data[key] != null ? data[key].toString() : ''])
                ) as FinancialDataState;
                
                setFormData(mappedData);

            } catch (err: any) {
                setError(`Échec de la récupération des données initiales: ${err.message}`);
            } finally {
                setIsFetchingInitialData(false);
            }
        };

        if (companyId) {
             fetchInitialData();
        }
    }, [companyId]);

    // GESTIONNAIRE DE SAISIE (STABLE grâce à useCallback)
    const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        
        // Stocke la chaîne de caractères brute, évitant la perte de focus
        setFormData(prev => ({
            ...prev,
            [id as NumericKeys]: value,
        }));
    }, []); 

    // Gestionnaire pour la sélection du fichier
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setRapportFile(e.target.files[0]);
        } else {
            setRapportFile(null);
        }
    };

    // VÉRIFICATION DE LA VALIDITÉ DU FORMULAIRE
    const isFormValid = useMemo(() => {
        const allNumbersFilled = NUMERIC_KEYS.every(key => formData[key].toString().trim() !== '');
        const fileSelected = rapportFile !== null;
        return allNumbersFilled && fileSelected;
    }, [formData, rapportFile]); 


    // NETTOYAGE ET CONVERSION DES DONNÉES EN NUMBER AVANT L'ENVOI
    const sanitizeAndConvertFormData = () => {
        const cleanedData = {} as { [key: string]: number };

        NUMERIC_KEYS.forEach(key => {
            const value = formData[key].toString().replace(/,/g, '.').trim(); 
            const numericValue = parseFloat(value); 
            cleanedData[key] = isNaN(numericValue) ? 0 : numericValue;
        });

        return cleanedData as { [K in NumericKeys]: number };
    };


    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!companyId || !isFormValid) {
            setError("Veuillez remplir tous les champs numériques obligatoires et joindre un fichier.");
            return;
        }

        setIsLoading(true);

        const convertedFormData = sanitizeAndConvertFormData();
        const financeData = { ...convertedFormData, companyId: companyId };
        
        const dataToSend = new FormData();
        dataToSend.append('financeData', new Blob([JSON.stringify(financeData)], { type: 'application/json' }));
        dataToSend.append('rapportEtatFinancier', rapportFile!); 

        try {
            const response = await fetch(`${API_BASE_URL}/api/company/finance/submit`, {
                method: 'POST',
                credentials: 'include', 
                body: dataToSend, 
            });

            if (!response.ok) {
                 if (response.status === 401 || response.status === 403) {
                     throw new Error("Accès refusé. Veuillez vous connecter ou vérifier vos droits.");
                }
                
                let errorMessage = `Erreur (${response.status}) lors de la soumission.`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.detail || errorMessage;
                } catch (e) {
                    // Ignorer si la réponse d'erreur n'est pas du JSON
                }
                throw new Error(errorMessage);
            }

            setSuccess(true);
            // NOTE: Ne pas réinitialiser formData pour l'instant afin de conserver les données pour l'affichage de succès
            
        } catch (err: any) {
            setError(err.message || "Une erreur inattendue est survenue.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Rendu ---
    const isComponentDisabled = isLoading || isFetchingInitialData;

    if (isFetchingInitialData) {
         return (
             <div className="flex justify-center items-center h-96">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 <span className="ml-3 text-lg text-muted-foreground">Chargement des données existantes...</span>
             </div>
         );
    }
    
    return (
        <div className="w-full max-w-7xl mx-auto pt-8 pb-16">
            
            {/* HEADER et MESSAGES DE STATUT */}
            <header className="mb-12 p-8 bg-primary-foreground rounded-xl shadow-2xl border-l-6 border-primary">
                <h1 className="text-3xl font-bold text-foreground mb-3 flex items-center gap-3">
                    <Wallet className="w-8 h-8 text-primary" /> **Données et Rapport Financiers Annuels**
                </h1>
                <p className="text-lg text-muted-foreground">
                    Veuillez fournir les chiffres clés de votre dernier exercice financier (ID Société: **{companyId || 'N/A'}**) et joindre le rapport certifié.
                </p>
            </header>
            
            {(error) && !success && (
                <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-red-900/20 border border-red-600 text-red-400">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* MESSAGE DE SUCCÈS AMÉLIORÉ AVEC ANIMATION */}
            {success && (
                <div className="p-4 rounded-xl shadow-2xl transition-all duration-500 ease-out transform scale-100 opacity-100">
                    <div className="text-center p-12 mb-6 rounded-xl bg-green-900/30 border-2 border-green-600 shadow-2xl shadow-green-900/50">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 animate-bounce-slow" /> 
                        <h2 className="text-3xl font-extrabold text-green-200 mb-3">
                            Soumission Réussie !
                        </h2>
                        <p className="text-xl text-green-300 font-medium">
                            Votre dépôt a été soumis. **Merci de patienter, nous allons l'analyser et vous répondrons prochainement.**
                        </p>
                        <p className="text-sm text-green-500 mt-4">
                            ID Société: {companyId}
                        </p>
                    </div>
                </div>
            )}
            
            {/* AFFICHAGE DU FORMULAIRE SEULEMENT SI PAS DE SUCCÈS */}
            {(companyId && !success) && (
                <form onSubmit={handleFormSubmit} className="bg-card p-10 rounded-xl shadow-2xl border border-border">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        
                        {/* COLONNE 1: BILAN */}
                        <section className="p-6 border border-border rounded-lg bg-gray-50/5 shadow-inner">
                            <h2 className="text-xl font-bold mb-6 text-secondary flex items-center gap-2 border-b border-border pb-2">
                                <BookOpen className="w-5 h-5" /> 1. Bilan (Balance Sheet)
                            </h2>
                            <StableInput 
                                id="actifTotal" label="Actif Total" description="Somme de l'actif immobilisé et circulant." 
                                value={formData.actifTotal} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <StableInput 
                                id="actifImmobilise" label="Actif Immobilisé" description="Valeur des immobilisations à long terme." 
                                value={formData.actifImmobilise} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <StableInput 
                                id="actifCirculant" label="Actif Circulant" description="Stocks, créances clients, trésorerie." 
                                value={formData.actifCirculant} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <hr className="my-4 border-dashed border-border" />
                            <StableInput 
                                id="passifTotal" label="Passif Total" description="Somme des capitaux propres et des dettes." 
                                value={formData.passifTotal} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <StableInput 
                                id="capitauxPropres" label="Capitaux Propres" description="Fonds propres de la société." 
                                value={formData.capitauxPropres} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <StableInput 
                                id="dettes" label="Dettes" description="Total des dettes à court et long terme." 
                                value={formData.dettes} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                        </section>

                        {/* COLONNE 2: COMPTE DE RÉSULTAT */}
                        <section className="p-6 border border-border rounded-lg bg-gray-50/5 shadow-inner">
                            <h2 className="text-xl font-bold mb-6 text-secondary flex items-center gap-2 border-b border-border pb-2">
                                <TrendingUp className="w-5 h-5" /> 2. Compte de Résultat (P&L)
                            </h2>
                            <StableInput 
                                id="chiffreAffaires" label="Chiffre d'Affaires" description="Ventes nettes de biens et services." 
                                value={formData.chiffreAffaires} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <StableInput 
                                id="produitsTotal" label="Produits Total" description="Total des produits d'exploitation et financiers." 
                                value={formData.produitsTotal} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <StableInput 
                                id="chargesTotal" label="Charges Total" description="Total des charges d'exploitation et financières." 
                                value={formData.chargesTotal} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <StableInput 
                                id="resultatNet" label="Résultat Net" description="Bénéfice ou perte après impôts (accepte les valeurs négatives)." 
                                value={formData.resultatNet} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                        </section>

                        {/* COLONNE 3: FLUX DE TRÉSORERIE ET RAPPORT */}
                        <section className="p-6 border border-border rounded-lg bg-gray-50/5 shadow-inner">
                            <h2 className="text-xl font-bold mb-6 text-secondary flex items-center gap-2 border-b border-border pb-2">
                                <DollarSign className="w-5 h-5" /> 3. Flux & Rapport
                            </h2>
                            
                            {/* Flux de Trésorerie */}
                            <h3 className="text-lg font-semibold mb-3 text-foreground/80">Flux de Trésorerie</h3>
                            <StableInput 
                                id="fluxOperationnels" label="Flux Opérationnels" description="Trésorerie générée par l'activité courante." 
                                value={formData.fluxOperationnels} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <StableInput 
                                id="fluxInvestissement" label="Flux d'Investissement" description="Trésorerie liée aux acquisitions/cessions d'actifs." 
                                value={formData.fluxInvestissement} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <StableInput 
                                id="fluxFinancement" label="Flux de Financement" description="Trésorerie liée à l'emprunt et aux capitaux propres." 
                                value={formData.fluxFinancement} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            <StableInput 
                                id="variationNetteTresorerie" label="Variation Nette de Trésorerie" description="Changement total de trésorerie sur la période." 
                                value={formData.variationNetteTresorerie} onChange={handleNumberChange} disabled={isComponentDisabled}
                            />
                            
                            {/* Rapport Fichier (inchangé) */}
                            <hr className="my-6 border-dashed border-border" />
                            <h3 className="text-lg font-semibold mb-3 text-foreground/80">Rapport Financier Officiel</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                                    <FileText className="w-4 h-4 text-primary" /> Rapport État Financier (PDF/ZIP/RAR) *
                                </label>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Veuillez joindre le document officiel certifié (format PDF/ZIP/RAR).
                                </p>
                                <input
                                    id="rapportEtatFinancier"
                                    type="file"
                                    accept=".pdf,.zip,.rar"
                                    required
                                    onChange={handleFileChange}
                                    disabled={isComponentDisabled}
                                    className="w-full p-2 border border-border bg-input rounded-lg text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                                />
                                {rapportFile && <p className="mt-2 text-sm text-green-500 font-medium">Fichier prêt : **{rapportFile.name}**</p>}
                                {!rapportFile && <p className="mt-2 text-sm text-red-500/70">Le rapport officiel est requis.</p>}
                            </div>
                        </section>
                        
                    </div>

                    {/* BOUTON ET STATUT DE SOUMISSION */}
                    <div className="md:col-span-3 pt-8">
                        <hr className="my-6 border-border"/>
                        
                        <button 
                            type="submit"
                            disabled={isComponentDisabled || !isFormValid}
                            className={`py-3 px-8 rounded-lg font-bold transition-all duration-300 flex items-center gap-3 w-full justify-center text-white text-lg 
                                ${isComponentDisabled || !isFormValid 
                                    ? 'bg-gray-700 cursor-not-allowed opacity-70' 
                                    : 'bg-primary shadow-xl hover:bg-primary/90'
                                }`
                            }
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" /> **Enregistrement des données et du rapport...**
                                </>
                            ) : (
                                <>
                                    Soumettre l'État Financier
                                    <Save className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default EtatFinanceForm;