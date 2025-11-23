import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, FileUp, Save, Loader2, AlertTriangle, CheckCircle, 
    FileText, Upload, Info 
} from 'lucide-react';

// Interface pour les données textuelles (correspond au CompanyValidationRequest.java)
interface ValidationData {
    companyId: number;
    nomLegalComplet: string;
    numeroImmatriculation: string;
    adresseSiegeSocial: string;
    nomPrenomPresidentLegal: string;
    numeroTvaTaxe: string;
}

// URL de base de votre API Spring Boot
const API_BASE_URL = 'http://localhost:9090';

// Composant pour un champ de fichier réutilisable avec description
const FileInput: React.FC<{ 
    label: string, 
    name: string, 
    description: string,
    required: boolean,
    file: File | null,
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileKey: string) => void,
    isLoading: boolean
}> = ({ label, name, description, required, file, onFileChange, isLoading }) => (
    <div className="mb-6 p-4 border border-dashed border-gray-400/50 rounded-lg hover:border-primary transition duration-150 bg-gray-50/5">
        <label className="block text-base font-semibold text-foreground mb-1 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> {label} {required && <span className="text-red-500">*</span>}
        </label>
        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
            <Info className="w-4 h-4 text-primary/70" /> {description}
        </p>
        
        <input
            id={name}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png" // Limiter les types de fichiers acceptés
            required={required}
            onChange={(e) => onFileChange(e, name)}
            disabled={isLoading}
            className="w-full p-2 border border-border bg-input rounded-lg text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
        />
        {file && <p className="mt-2 text-sm text-green-500 font-medium">Fichier prêt : {file.name}</p>}
        {!file && <p className="mt-2 text-sm text-red-500/70">Aucun fichier sélectionné.</p>}
    </div>
);


const CompanyValidation: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const urlCompanyId = searchParams.get('companyId');
    const companyId = urlCompanyId ? parseInt(urlCompanyId) : null;

    // --- États des champs de texte ---
    const [formData, setFormData] = useState<Omit<ValidationData, 'companyId'>>({
        nomLegalComplet: '',
        numeroImmatriculation: '',
        adresseSiegeSocial: '',
        nomPrenomPresidentLegal: '',
        numeroTvaTaxe: '',
    });

    // --- États des fichiers (MultipartFile) ---
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        certificatImmatriculation: null,
        pieceIdentiteLegal: null,
        statutsSociete: null,
        justificatifDomiciliation: null,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Initialisation de l'ID
    useEffect(() => {
        if (!companyId || isNaN(companyId)) {
            setError("Erreur: ID de société non valide ou manquant dans l'URL.");
        }
    }, [companyId]);

    // Gestionnaire pour les changements dans les champs de texte
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    // Gestionnaire pour la sélection des fichiers (identique, mais propre)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileKey: string) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => ({
                ...prev,
                [fileKey]: e.target.files![0],
            }));
        } else {
            setFiles(prev => ({
                ...prev,
                [fileKey]: null,
            }));
        }
    };

    // Vérification de la complétude du formulaire
    const isFormValid = () => {
        // Champs de texte obligatoires
        const requiredText = ['nomLegalComplet', 'numeroImmatriculation', 'adresseSiegeSocial', 'nomPrenomPresidentLegal'];
        const textFilled = requiredText.every(key => (formData as any)[key].trim().length > 0);
        
        // Fichiers obligatoires
        const requiredFiles = ['certificatImmatriculation', 'pieceIdentiteLegal', 'statutsSociete', 'justificatifDomiciliation'];
        const filesSelected = requiredFiles.every(key => files[key] !== null);

        return textFilled && filesSelected;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!companyId || !isFormValid()) {
            setError("Veuillez remplir toutes les informations légales et soumettre tous les documents requis.");
            return;
        }

        setIsLoading(true);

        // --- 1. Création de l'objet FormData (Multipart) ---
        const dataToSend = new FormData();
        
        const validationData: ValidationData = {
            ...formData,
            companyId: companyId,
        };

        // Ajout des données JSON sous la clé "validationData"
        dataToSend.append('validationData', new Blob([JSON.stringify(validationData)], { type: 'application/json' }));
        
        // Ajout des fichiers (les clés DOIVENT correspondre au contrôleur Spring Boot)
        dataToSend.append('certificatImmatriculation', files.certificatImmatriculation!);
        dataToSend.append('pieceIdentiteLegal', files.pieceIdentiteLegal!);
        dataToSend.append('statutsSociete', files.statutsSociete!);
        dataToSend.append('justificatifDomiciliation', files.justificatifDomiciliation!);

        try {
            const response = await fetch(`${API_BASE_URL}/api/company/validation/submit`, {
                method: 'POST',
                credentials: 'include', 
                body: dataToSend, 
            });

            if (!response.ok) {
                // Gestion des erreurs
                let errorMessage = `Erreur (${response.status}) lors de la soumission de la validation.`;
                const responseText = await response.text();
                
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorData.detail || errorMessage;
                } catch (e) {
                    console.error("Réponse non-JSON reçue lors de l'erreur:", responseText);
                }

                throw new Error(errorMessage);
            }

            // Succès
            setSuccess(true);
            setIsLoading(false);
            
            // Redirection vers une page de statut (en utilisant le chemin corrigé précédemment)
            setTimeout(() => {
                navigate(`/dashboard/EtatFinanceForm?companyId=${companyId}&stage=validation_submitted`);
            }, 2000);

        } catch (err: any) {
            setError(err.message || "Une erreur inattendue est survenue.");
            setIsLoading(false);
        }
    };
    
    // --- Rendu ---
    
    return (
        <div className="w-full max-w-6xl mx-auto pt-6 pb-12">
            
            {/* HEADER */}
            <header className="mb-10 p-6 bg-primary-foreground rounded-xl shadow-2xl border-l-4 border-primary">
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-primary" /> **Phase 2 : Validation KYC & Légale**
                </h1>
                <p className="text-lg text-muted-foreground">
                    Soumettez les informations détaillées et les documents pour la société ID: **{companyId || 'N/A'}**.
                </p>
            </header>
            
            {/* Message d'erreur initial */}
            {(!companyId || error) && !success && (
                <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-red-900/20 border border-red-600 text-red-400">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="font-medium">
                        {error || "ID de société manquant ou invalide. Impossible de continuer."}
                    </span>
                </div>
            )}

            {(companyId && !error && !success) && (
                <form onSubmit={handleFormSubmit} className="bg-card p-10 rounded-xl shadow-2xl border border-border grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    {/* SECTION 1: INFORMATIONS LÉGALES (TEXTE) */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-secondary flex items-center gap-2 border-b border-border pb-2">
                            <FileText className="w-6 h-6" /> 1. Détails de l'Enregistrement
                        </h2>

                        <div className="space-y-6">
                            {/* Nom Légal Complet */}
                            <div>
                                <label htmlFor="nomLegalComplet" className="block text-sm font-medium text-foreground mb-1">Nom Légal Complet *</label>
                                <input id="nomLegalComplet" type="text" value={formData.nomLegalComplet} onChange={handleTextChange} required disabled={isLoading} placeholder="Ex: SAS MonEntreprise Digitale" className="w-full p-3 border border-border bg-input rounded-lg text-foreground focus:ring-primary focus:border-primary" />
                            </div>

                            {/* Numéro Immatriculation */}
                            <div>
                                <label htmlFor="numeroImmatriculation" className="block text-sm font-medium text-foreground mb-1">Numéro d'Immatriculation (Siret/Siren) *</label>
                                <input id="numeroImmatriculation" type="text" value={formData.numeroImmatriculation} onChange={handleTextChange} required disabled={isLoading} placeholder="Ex: 123456789 00010" className="w-full p-3 border border-border bg-input rounded-lg text-foreground focus:ring-primary focus:border-primary" />
                            </div>

                            {/* Adresse Siège Social */}
                            <div>
                                <label htmlFor="adresseSiegeSocial" className="block text-sm font-medium text-foreground mb-1">Adresse Siège Social *</label>
                                <input id="adresseSiegeSocial" type="text" value={formData.adresseSiegeSocial} onChange={handleTextChange} required disabled={isLoading} placeholder="Ex: 10 Rue de la Paix, 75002 Paris" className="w-full p-3 border border-border bg-input rounded-lg text-foreground focus:ring-primary focus:border-primary" />
                            </div>

                            {/* Nom/Prénom Président Légal */}
                            <div>
                                <label htmlFor="nomPrenomPresidentLegal" className="block text-sm font-medium text-foreground mb-1">Nom et Prénom du Représentant Légal *</label>
                                <input id="nomPrenomPresidentLegal" type="text" value={formData.nomPrenomPresidentLegal} onChange={handleTextChange} required disabled={isLoading} placeholder="Ex: Jean Dupont" className="w-full p-3 border border-border bg-input rounded-lg text-foreground focus:ring-primary focus:border-primary" />
                            </div>

                            {/* Numéro TVA Taxe (Optionnel) */}
                            <div>
                                <label htmlFor="numeroTvaTaxe" className="block text-sm font-medium text-foreground mb-1">Numéro TVA/Taxe (Optionnel)</label>
                                <input id="numeroTvaTaxe" type="text" value={formData.numeroTvaTaxe} onChange={handleTextChange} disabled={isLoading} placeholder="Ex: FR00000000000" className="w-full p-3 border border-border bg-input rounded-lg text-foreground focus:ring-primary focus:border-primary" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: TÉLÉCHARGEMENT DE DOCUMENTS (MULTIPART) */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-secondary flex items-center gap-2 border-b border-border pb-2">
                            <FileUp className="w-6 h-6" /> 2. Téléchargement des Documents KYC
                        </h2>
                        
                        <FileInput 
                            label="Certificat d'Immatriculation (Kbis)" 
                            name="certificatImmatriculation" 
                            description="Document officiel du registre du commerce prouvant l'existence légale de la société. (PDF/JPG)"
                            file={files.certificatImmatriculation}
                            onFileChange={handleFileChange}
                            isLoading={isLoading}
                            required={true} 
                        />
                        <FileInput 
                            label="Pièce d'Identité du Représentant Légal" 
                            name="pieceIdentiteLegal" 
                            description="Copie recto-verso de la CNI ou du passeport du signataire légal. (PDF/JPG)"
                            file={files.pieceIdentiteLegal}
                            onFileChange={handleFileChange}
                            isLoading={isLoading}
                            required={true} 
                        />
                        <FileInput 
                            label="Statuts de la Société" 
                            name="statutsSociete" 
                            description="Version complète et à jour des statuts de la société signée. (PDF)"
                            file={files.statutsSociete}
                            onFileChange={handleFileChange}
                            isLoading={isLoading}
                            required={true} 
                        />
                        <FileInput 
                            label="Justificatif de Domiciliation Commerciale" 
                            name="justificatifDomiciliation" 
                            description="Facture récente d'électricité ou contrat de bail de moins de 3 mois au nom de la société. (PDF)"
                            file={files.justificatifDomiciliation}
                            onFileChange={handleFileChange}
                            isLoading={isLoading}
                            required={true} 
                        />
                    </div>

                    {/* PIED DE FORMULAIRE ET SOUMISSION */}
                    <div className="md:col-span-2 pt-6">
                        <hr className="my-6 border-border"/>
                        
                        {success && (
                            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-900/20 border border-green-600 text-green-400 font-bold">
                                <CheckCircle className="w-5 h-5" />
                                <span>Validation soumise ! Vos documents sont en cours d'examen. Redirection...</span>
                            </div>
                        )}
                        
                        {/* Bouton de Soumission */}
                        <button 
                            type="submit"
                            disabled={isLoading || !isFormValid()}
                            className={`py-3 px-8 rounded-lg font-bold transition-all duration-300 flex items-center gap-3 w-full justify-center text-white text-lg 
                                ${isLoading || !isFormValid() 
                                    ? 'bg-gray-700 cursor-not-allowed opacity-70' 
                                    : 'bg-primary shadow-xl hover:bg-primary/90'
                                }`
                            }
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" /> **Envoi des {Object.values(files).filter(f => f).length} documents en cours...**
                                </>
                            ) : (
                                <>
                                    Soumettre l'Ensemble de Validation
                                    <Save className="w-6 h-6" />
                                </>
                            )}
                        </button>
                        
                        {!isFormValid() && !isLoading && (
                            <p className="mt-4 text-center text-sm text-red-500 flex items-center justify-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Veuillez remplir tous les champs de texte et sélectionner les 4 fichiers requis.
                            </p>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
};

export default CompanyValidation;