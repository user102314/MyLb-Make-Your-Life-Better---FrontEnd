import React, { useState, useEffect } from 'react';
import { 
    Building2, CheckCircle, Clock, FileText, XCircle, 
    Calendar, Loader2, AlertTriangle, ArrowRight, 
    Eye, Download, X,
    User, Shield, Home, Receipt,
    Landmark, CreditCard, PieChart, Activity,
    TrendingUp, BarChart3, DollarSign
} from 'lucide-react';

// --- Interfaces basées sur le DTO ---

interface CompanySummary {
    companyId: number;
    companyName: string;
    status: string;
    dateInscri: string;
}

interface CompanyDetailsResponse {
    companyId: number;
    ownerID: number;
    companyName: string;
    dateInscri: string;
    status: string;
    nomLegalComplet: string;
    numeroImmatriculation: string;
    adresseSiegeSocial: string;
    nomPrenomPresidentLegal: string;
    numeroTvaTaxe: string;
    certificatImmatriculation: number[];
    pieceIdentiteRepresentantLegal: number[];
    statutsSociete: number[];
    justificatifDomiciliationCommerciale: number[];
    actifTotal: number;
    actifImmobilise: number;
    actifCirculant: number;
    passifTotal: number;
    capitauxPropres: number;
    dettes: number;
    produitsTotal: number;
    chargesTotal: number;
    resultatNet: number;
    chiffreAffaires: number;
    fluxOperationnels: number;
    fluxInvestissement: number;
    fluxFinancement: number;
    variationNetteTresorerie: number;
    rapportEtatFinancier: number[];
}

// Définition de la base de l'API
const API_BASE_URL = 'http://localhost:9090';

// Fonction pour convertir byte[] en URL de données
const bytesToDataUrl = (bytes: number[], mimeType: string = 'application/octet-stream'): string => {
    if (!bytes || bytes.length === 0) return '';
    const byteArray = new Uint8Array(bytes);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
};

// Fonction pour déterminer le type MIME
const getMimeType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf': return 'application/pdf';
        case 'jpg': case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'doc': return 'application/msword';
        case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        default: return 'application/octet-stream';
    }
};

// Composants Helper
const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; className?: string }> = 
({ title, icon: Icon, children, className = '' }) => (
    <div className={`bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 ${className}`}>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/50">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const InfoItem: React.FC<{ icon: React.ElementType; label: string; value: string; valueColor?: string }> = 
({ icon: Icon, label, value, valueColor = 'text-white' }) => (
    <div className="flex justify-between items-center py-2">
        <div className="flex items-center gap-2 text-slate-300">
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}:</span>
        </div>
        <span className={`text-sm font-semibold ${valueColor}`}>{value}</span>
    </div>
);

const DocumentItem: React.FC<{ title: string; bytes: number[]; fileName: string }> = 
({ title, bytes, fileName }) => {
    const hasDocument = bytes && bytes.length > 0;
    const dataUrl = hasDocument ? bytesToDataUrl(bytes, getMimeType(fileName)) : '';

    const handleDownload = () => {
        if (!hasDocument) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleView = () => {
        if (!hasDocument) return;
        window.open(dataUrl, '_blank');
    };

    return (
        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-white font-medium">{title}</span>
            </div>
            <div className="flex gap-2">
                {hasDocument ? (
                    <>
                        <button 
                            onClick={handleView}
                            className="p-1.5 text-blue-400 hover:bg-blue-400/20 rounded transition"
                            title="Voir le document"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={handleDownload}
                            className="p-1.5 text-green-400 hover:bg-green-400/20 rounded transition"
                            title="Télécharger"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <span className="text-xs text-slate-500 px-2 py-1">Non disponible</span>
                )}
            </div>
        </div>
    );
};

// --- Composant Principal ---

const ListComponey: React.FC = () => {
    const [companies, setCompanies] = useState<CompanySummary[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanyDetailsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    // Fonction utilitaire pour obtenir les icônes et styles basés sur le statut
    const getStatusDisplay = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING':
                return { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20', label: 'En attente' };
            case 'APPROVED':
            case 'ACCEPTED':
                return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/20', label: 'Approuvée' };
            case 'REJECTED':
                return { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/20', label: 'Rejetée' };
            default:
                return { icon: FileText, color: 'text-gray-500', bgColor: 'bg-gray-500/20', label: 'Inconnu' };
        }
    };

    // Ajout des styles pour le scroll
    useEffect(() => {
        const scrollStyles = `
            .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: rgba(100, 116, 139, 0.3) transparent;
            }

            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
                border-radius: 3px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(100, 116, 139, 0.4);
                border-radius: 3px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(100, 116, 139, 0.6);
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:active {
                background: rgba(100, 116, 139, 0.8);
            }
        `;

        if (typeof document !== 'undefined') {
            const existingStyle = document.getElementById('custom-scroll-styles');
            if (!existingStyle) {
                const styleSheet = document.createElement('style');
                styleSheet.id = 'custom-scroll-styles';
                styleSheet.textContent = scrollStyles;
                document.head.appendChild(styleSheet);
            }
        }
    }, []);

    // Fonction de récupération des companies
    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/api/companies/my-list`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.status === 401 || response.status === 403) {
                    throw new Error("Session expirée ou accès refusé. Veuillez vous reconnecter.");
                }

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Erreur de serveur (${response.status}): ${errorBody || response.statusText}`);
                }

                const data: CompanySummary[] = await response.json();
                setCompanies(data);

            } catch (err: any) {
                console.error("Erreur lors de la récupération des compagnies:", err);
                setError(err.message || "Une erreur inattendue est survenue lors du chargement des données.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    // Fonction pour récupérer les détails d'une company
    const fetchCompanyDetails = async (companyId: number) => {
        setIsDetailsLoading(true);
        setDetailsError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/companies/${companyId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Erreur lors du chargement des détails: ${response.status}`);
            }

            const data: CompanyDetailsResponse = await response.json();
            setSelectedCompany(data);

        } catch (err: any) {
            console.error("Erreur lors de la récupération des détails:", err);
            setDetailsError(err.message || "Erreur lors du chargement des détails.");
        } finally {
            setIsDetailsLoading(false);
        }
    };

    // Fonction pour formater les montants
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Fonction pour fermer les détails
    const closeDetails = () => {
        setSelectedCompany(null);
        setDetailsError(null);
    };

    // --- Rendu du Chargement et des Erreurs ---

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-3 text-lg text-muted-foreground">Chargement de vos compagnies...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-red-900/10 border border-red-600/50 rounded-lg text-red-400 max-w-lg mx-auto mt-12">
                <AlertTriangle className="w-8 h-8 mb-3" />
                <h2 className="text-xl font-bold mb-2">Erreur de Connexion</h2>
                <p className="text-center">{error}</p>
                {error.includes("reconnecter") && (
                    <button 
                        onClick={() => window.location.href = '/login'}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Se Reconnecter
                    </button>
                )}
            </div>
        );
    }

    if (companies.length === 0) {
        return (
            <div className="text-center p-12 bg-gray-700/10 border border-border rounded-lg max-w-xl mx-auto mt-12">
                <Building2 className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-foreground">Aucune Compagnie Enregistrée</h2>
                <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore soumis de compagnie. Commencez par en ajouter une.
                </p>
                <a 
                    href="/add-company"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition"
                >
                    Ajouter une Compagnie <ArrowRight className="w-5 h-5" />
                </a>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-extrabold mb-10 text-foreground border-b border-border pb-3">
                <Building2 className="w-8 h-8 inline-block mr-3 text-primary" />
                Vos Compagnies Enregistrées ({companies.length})
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {companies.map((company) => {
                    const status = getStatusDisplay(company.status);
                    
                    return (
                        <div 
                            key={company.companyId} 
                            className="bg-card p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-border flex flex-col justify-between group hover:scale-[1.02]"
                        >
                            {/* En-tête de la Carte */}
                            <div className="mb-4 pb-4 border-b border-border/50">
                                <h2 className="text-xl font-bold text-foreground truncate flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" /> 
                                    {company.companyName}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    ID: <span className="font-mono">#{company.companyId}</span>
                                </p>
                            </div>

                            {/* Détails */}
                            <div className="space-y-3 mb-6">
                                {/* Statut */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm">
                                        <status.icon className={`w-4 h-4 mr-2 ${status.color}`} />
                                        <span className="font-semibold text-foreground">Statut:</span>
                                    </div>
                                    <span className={`font-medium px-3 py-1 rounded-full text-xs ${status.color} ${status.bgColor} border ${status.color.replace('text', 'border')}/30`}>
                                        {status.label}
                                    </span>
                                </div>

                                {/* Date d'Inscription */}
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span className="font-semibold text-foreground">Inscrite le:</span>
                                    <span className="ml-2">
                                        {company.dateInscri ? new Date(company.dateInscri).toLocaleDateString('fr-FR') : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Boutons d'Action */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => fetchCompanyDetails(company.companyId)}
                                    className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                                >
                                    <Eye className="w-4 h-4" />
                                    Voir Détails
                                </button>
                                <a 
                                    href={`/finance-form?companyId=${company.companyId}`}
                                    className="inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition"
                                >
                                    <DollarSign className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal des Détails */}
            {selectedCompany && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {isDetailsLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="ml-3 text-lg text-muted-foreground">Chargement des détails...</p>
                            </div>
                        ) : detailsError ? (
                            <div className="flex flex-col items-center justify-center p-8 text-red-400">
                                <AlertTriangle className="w-8 h-8 mb-3" />
                                <p>{detailsError}</p>
                                <button 
                                    onClick={closeDetails}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* En-tête du modal */}
                                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-slate-900 to-slate-800">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-8 h-8 text-primary" />
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">
                                                {selectedCompany.companyName}
                                            </h2>
                                            <p className="text-slate-300">
                                                ID: #{selectedCompany.companyId} • Propriétaire: #{selectedCompany.ownerID}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={closeDetails}
                                        className="p-2 hover:bg-white/10 rounded-lg transition"
                                    >
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>

                                {/* Contenu scrollable */}
                                <div className="flex-1 overflow-hidden">
                                    <div className="h-full overflow-y-auto custom-scrollbar p-6">
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Informations Générales */}
                                                <div className="space-y-6">
                                                    <Section title="Informations Légales" icon={FileText}>
                                                        <InfoItem icon={User} label="Nom Légal Complet" value={selectedCompany.nomLegalComplet} />
                                                        <InfoItem icon={Shield} label="Numéro Immatriculation" value={selectedCompany.numeroImmatriculation} />
                                                        <InfoItem icon={Home} label="Adresse Siège Social" value={selectedCompany.adresseSiegeSocial} />
                                                        <InfoItem icon={User} label="Président Légal" value={selectedCompany.nomPrenomPresidentLegal} />
                                                        <InfoItem icon={Receipt} label="Numéro TVA" value={selectedCompany.numeroTvaTaxe} />
                                                    </Section>

                                                    <Section title="Statut et Date" icon={Calendar}>
                                                        <InfoItem icon={getStatusDisplay(selectedCompany.status).icon} 
                                                                label="Statut" 
                                                                value={getStatusDisplay(selectedCompany.status).label} 
                                                                valueColor={getStatusDisplay(selectedCompany.status).color} />
                                                        <InfoItem icon={Calendar} label="Date d'Inscription" 
                                                                value={new Date(selectedCompany.dateInscri).toLocaleDateString('fr-FR')} />
                                                    </Section>
                                                </div>

                                                {/* Informations Financières */}
                                                <div className="space-y-6">
                                                    <Section title="Bilan Financier" icon={Landmark}>
                                                        <InfoItem icon={PieChart} label="Actif Total" value={formatCurrency(selectedCompany.actifTotal)} />
                                                        <InfoItem icon={Building2} label="Actif Immobilisé" value={formatCurrency(selectedCompany.actifImmobilise)} />
                                                        <InfoItem icon={Activity} label="Actif Circulant" value={formatCurrency(selectedCompany.actifCirculant)} />
                                                        <InfoItem icon={CreditCard} label="Passif Total" value={formatCurrency(selectedCompany.passifTotal)} />
                                                        <InfoItem icon={TrendingUp} label="Capitaux Propres" value={formatCurrency(selectedCompany.capitauxPropres)} />
                                                        <InfoItem icon={DollarSign} label="Dettes" value={formatCurrency(selectedCompany.dettes)} />
                                                    </Section>

                                                    <Section title="Compte de Résultat" icon={BarChart3}>
                                                        <InfoItem icon={TrendingUp} label="Chiffre d'Affaires" value={formatCurrency(selectedCompany.chiffreAffaires)} />
                                                        <InfoItem icon={DollarSign} label="Produits Totaux" value={formatCurrency(selectedCompany.produitsTotal)} />
                                                        <InfoItem icon={Receipt} label="Charges Totales" value={formatCurrency(selectedCompany.chargesTotal)} />
                                                        <InfoItem icon={Activity} label="Résultat Net" value={formatCurrency(selectedCompany.resultatNet)} />
                                                    </Section>
                                                </div>
                                            </div>

                                            {/* Flux de Trésorerie - Pleine largeur */}
                                            <Section title="Flux de Trésorerie" icon={Activity}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <InfoItem icon={DollarSign} label="Flux Opérationnels" value={formatCurrency(selectedCompany.fluxOperationnels)} />
                                                    <InfoItem icon={TrendingUp} label="Flux Investissement" value={formatCurrency(selectedCompany.fluxInvestissement)} />
                                                    <InfoItem icon={CreditCard} label="Flux Financement" value={formatCurrency(selectedCompany.fluxFinancement)} />
                                                    <InfoItem icon={BarChart3} label="Variation Trésorerie" value={formatCurrency(selectedCompany.variationNetteTresorerie)} />
                                                </div>
                                            </Section>

                                            {/* Documents */}
                                            <Section title="Documents" icon={FileText}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <DocumentItem 
                                                        title="Certificat d'Immatriculation" 
                                                        bytes={selectedCompany.certificatImmatriculation}
                                                        fileName="certificat_immatriculation.pdf"
                                                    />
                                                    <DocumentItem 
                                                        title="Pièce d'Identité Représentant" 
                                                        bytes={selectedCompany.pieceIdentiteRepresentantLegal}
                                                        fileName="piece_identite.pdf"
                                                    />
                                                    <DocumentItem 
                                                        title="Statuts de Société" 
                                                        bytes={selectedCompany.statutsSociete}
                                                        fileName="statuts_societe.pdf"
                                                    />
                                                    <DocumentItem 
                                                        title="Justificatif Domiciliation" 
                                                        bytes={selectedCompany.justificatifDomiciliationCommerciale}
                                                        fileName="domiciliation_commerciale.pdf"
                                                    />
                                                    <DocumentItem 
                                                        title="Rapport État Financier" 
                                                        bytes={selectedCompany.rapportEtatFinancier}
                                                        fileName="rapport_financier.pdf"
                                                    />
                                                </div>
                                            </Section>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListComponey;