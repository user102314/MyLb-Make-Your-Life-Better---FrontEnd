import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, Loader2, X, Download, FileText, Check, XCircle } from 'lucide-react';

interface CompanyDetailsResponse {
    companyId: number;
    ownerID: number;
    companyName: string;
    dateInscri: string;
    status: string;
    nomLegalComplet?: string;
    numeroImmatriculation?: string;
    adresseSiegeSocial?: string;
    nomPrenomPresidentLegal?: string;
    numeroTvaTaxe?: string;
    certificatImmatriculation?: string;
    pieceIdentiteRepresentantLegal?: string;
    statutsSociete?: string;
    justificatifDomiciliationCommerciale?: string;
    actifTotal?: number;
    actifImmobilise?: number;
    actifCirculant?: number;
    passifTotal?: number;
    capitauxPropres?: number;
    dettes?: number;
    produitsTotal?: number;
    chargesTotal?: number;
    resultatNet?: number;
    chiffreAffaires?: number;
    fluxOperationnels?: number;
    fluxInvestissement?: number;
    fluxFinancement?: number;
    variationNetteTresorerie?: number;
    rapportEtatFinancier?: string;
}

const Button = ({ children, onClick, variant = 'default', disabled = false, className = '' }) => {
    let baseStyle = "px-4 py-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none";
    
    switch (variant) {
        case 'outline':
            baseStyle += " bg-transparent border-2 border-gray-600 text-gray-300 hover:bg-gray-700";
            break;
        case 'destructive':
            baseStyle += " bg-red-600 text-white hover:bg-red-700";
            break;
        case 'success':
            baseStyle += " bg-green-600 text-white hover:bg-green-700";
            break;
        default:
            baseStyle += " bg-blue-600 text-white hover:bg-blue-700";
            break;
    }

    if (disabled) {
        baseStyle += " opacity-50 cursor-not-allowed";
    }

    return (
        <button className={`${baseStyle} ${className}`} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
};

const Card = ({ children, className = '' }) => (
    <div className={`bg-gray-800 border border-gray-700 shadow-lg rounded-xl ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className = '' }) => (
    <div className={`p-5 border-b border-gray-700 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-xl font-bold text-white ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }) => (
    <div className={`p-5 ${className}`}>{children}</div>
);

const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-700 rounded-lg ${className}`}></div>
);

const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div 
                className="relative w-full max-w-6xl max-h-[95vh] mx-4 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                role="dialog"
                aria-modal="true"
            >
                {children}
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-gray-700 rounded-full p-2 shadow-lg"
                    onClick={() => onOpenChange(false)}
                    aria-label="Close"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};

const DialogContent = ({ children, className = '' }) => (
    <div className={`p-6 max-h-[90vh] overflow-y-auto ${className}`}>{children}</div>
);

const DialogHeader = ({ children, className = '' }) => (
    <div className={`pb-4 border-b border-gray-700 mb-4 ${className}`}>{children}</div>
);

const DialogTitle = ({ children, className = '' }) => (
    <h2 className={`text-2xl font-extrabold text-white ${className}`}>{children}</h2>
);

const DialogDescription = ({ children, className = '' }) => (
    <p className={`text-sm text-gray-400 ${className}`}>{children}</p>
);

const API_BASE_URL = "http://localhost:9090/api/admin/companies";

const App = () => {
    const [companies, setCompanies] = useState<CompanyDetailsResponse[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanyDetailsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{companyId: number, status: string, companyName: string, ownerId: number} | null>(null);
    const [showStockForm, setShowStockForm] = useState(false);
    const [stockFormData, setStockFormData] = useState({
        nomStock: '',
        stockDisponible: '',
        stockReste: '',
        prixStock: '',
        etat: 'DISPONIBLE'
    });

    const getFileType = (base64String: string): string => {
        if (base64String.startsWith('/9j/') || base64String.startsWith('iVBOR')) {
            return 'image';
        } else if (base64String.startsWith('JVBERi')) {
            return 'pdf';
        }
        return 'unknown';
    };

    const handleDocument = (base64Data: string, fileName: string, action: 'view' | 'download') => {
        try {
            const fileType = getFileType(base64Data);
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            
            let mimeType = 'application/octet-stream';
            if (fileType === 'image') {
                mimeType = base64Data.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
            } else if (fileType === 'pdf') {
                mimeType = 'application/pdf';
            }
            
            const blob = new Blob([byteArray], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            
            if (action === 'view' && fileType === 'image') {
                setViewingImage(url);
            } else if (action === 'view' && fileType === 'pdf') {
                window.open(url, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Erreur lors du traitement du document:', err);
            alert('Impossible de traiter le document');
        }
    };

    const fetchAllCompanies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data: CompanyDetailsResponse[] = await response.json();
            setCompanies(data);
        } catch (err) {
            console.error("Erreur lors de la récupération des sociétés:", err);
            setError("Impossible de charger les sociétés. Vérifiez que l'API est démarrée sur le port 9090.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCompanyDetails = async (companyId: number) => {
        setLoadingDetails(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/${companyId}`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data: CompanyDetailsResponse = await response.json();
            setSelectedCompany(data);
        } catch (err) {
            console.error(`Erreur lors de la récupération des détails de ${companyId}:`, err);
            setError("Impossible de charger les détails de cette société.");
        } finally {
            setLoadingDetails(false);
        }
    };

    const updateCompanyStatus = async (companyId: number, newStatus: string) => {
        setUpdating(true);
        try {
            // Si c'est une acceptation, créer d'abord le stock
            if (newStatus === 'ACCEPTED' && showStockForm) {
                // Validation
                if (!stockFormData.nomStock || !stockFormData.stockDisponible || !stockFormData.prixStock) {
                    alert('Veuillez remplir tous les champs obligatoires');
                    setUpdating(false);
                    return;
                }

                // Validation des valeurs numériques
                const stockDisponible = parseInt(stockFormData.stockDisponible);
                const stockReste = stockFormData.stockReste ? parseInt(stockFormData.stockReste) : stockDisponible;
                const prixStock = parseFloat(stockFormData.prixStock);

                if (isNaN(stockDisponible) || isNaN(prixStock) || stockDisponible <= 0 || prixStock <= 0) {
                    alert('Veuillez entrer des valeurs valides pour le stock et le prix');
                    setUpdating(false);
                    return;
                }

                // S'assurer que les IDs sont bien des nombres
                const companyIdNumber = Number(companyId);
                const ownerIdNumber = Number(confirmAction.ownerId);

                if (isNaN(companyIdNumber) || isNaN(ownerIdNumber)) {
                    alert('Erreur: IDs invalides');
                    setUpdating(false);
                    return;
                }

                // Créer le stock - avec tous les champs obligatoires
                const stockPayload = {
                    nomStock: stockFormData.nomStock.trim(),
                    stockDisponible: stockDisponible,
                    stockReste: stockReste,
                    prixStock: prixStock,
                    etat: stockFormData.etat || 'DISPONIBLE',
                    idComponey: companyIdNumber,
                    ownerId: ownerIdNumber
                };

                console.log('📦 Payload envoyé:', JSON.stringify(stockPayload, null, 2));
                console.log('🔢 Types - companyId:', typeof companyId, '=', companyId);
                console.log('🔢 Types - ownerId:', typeof confirmAction.ownerId, '=', confirmAction.ownerId);
                console.log('🔢 Valeurs numériques:', {
                    idComponey: Number(companyId),
                    ownerId: Number(confirmAction.ownerId)
                });
                console.log('🧪 Validation JSON:', {
                    isValidJSON: true,
                    stringified: JSON.stringify(stockPayload)
                });
                console.log('🌐 URL cible: http://localhost:9090/api/stocks');
                console.log('🌐 Origin:', window.location.origin);

                const stockResponse = await fetch('http://localhost:9090/api/stocks', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(stockPayload),
                    mode: 'cors',
                    credentials: 'include'
                });

                console.log('📡 Réponse statut:', stockResponse.status);
                console.log('📡 URL appelée:', stockResponse.url);
                console.log('📡 Type:', stockResponse.type);
                console.log('📡 OK?:', stockResponse.ok);

                if (!stockResponse.ok) {
                    let errorText = '';
                    try {
                        const errorJson = await stockResponse.json();
                        errorText = JSON.stringify(errorJson, null, 2);
                        console.error('❌ Erreur JSON:', errorJson);
                    } catch {
                        errorText = await stockResponse.text();
                        console.error('❌ Erreur texte:', errorText);
                    }
                    throw new Error(`Échec de la création du stock (${stockResponse.status}): ${errorText}`);
                }

                const stockResult = await stockResponse.json();
                console.log('✅ Stock créé avec succès:', stockResult);
            }

            // Mettre à jour le statut de la compagnie
            const response = await fetch(`${API_BASE_URL}/${companyId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

            // Mise à jour locale
            setCompanies(prev => 
                prev.map(c => c.companyId === companyId ? {...c, status: newStatus} : c)
            );
            
            if (selectedCompany?.companyId === companyId) {
                setSelectedCompany(prev => prev ? {...prev, status: newStatus} : null);
            }

            setConfirmAction(null);
            setShowStockForm(false);
            setStockFormData({
                nomStock: '',
                stockDisponible: '',
                stockReste: '',
                prixStock: '',
                etat: 'DISPONIBLE'
            });

            alert(newStatus === 'ACCEPTED' ? 'Société acceptée avec succès!' : 'Société refusée');
        } catch (err) {
            console.error("Erreur:", err);
            alert('Échec de l\'opération: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchAllCompanies();
    }, [fetchAllCompanies]);

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return 'N/A';
        return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    };

    const DocumentButton = ({ base64Data, label, fileName }: { base64Data?: string, label: string, fileName: string }) => {
        if (!base64Data) return null;
        
        const fileType = getFileType(base64Data);
        const Icon = fileType === 'image' ? FileText : FileText;
        
        return (
            <div className="flex items-center p-3 bg-gray-700 border border-gray-600 rounded-lg">
                <Icon className="w-5 h-5 mr-2 text-blue-400" />
                <span className="text-sm flex-1 text-gray-300">{label}</span>
                <div className="flex gap-2">
                    {fileType === 'image' && (
                        <button
                            onClick={() => handleDocument(base64Data, fileName, 'view')}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Voir
                        </button>
                    )}
                    {fileType === 'pdf' && (
                        <button
                            onClick={() => handleDocument(base64Data, fileName, 'view')}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Ouvrir
                        </button>
                    )}
                    <button
                        onClick={() => handleDocument(base64Data, fileName, 'download')}
                        className="text-xs px-2 py-1 bg-gray-600 text-gray-200 rounded hover:bg-gray-500 transition"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    const renderDetailsContent = () => {
        if (loadingDetails) {
            return (
                <div className="flex flex-col justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="mt-3 text-gray-300">Chargement des détails...</span>
                </div>
            );
        }

        if (!selectedCompany) {
            return <p className="text-center text-red-400 p-4">Aucun détail disponible.</p>;
        }

        const company = selectedCompany;

        return (
            <div className="space-y-6">
                {/* Informations de base */}
                <section>
                    <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-3 text-blue-400">Informations de Base</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-300"><strong className="text-white">ID Société:</strong> <span className="font-medium">{company.companyId}</span></p>
                        <p className="text-gray-300"><strong className="text-white">ID Propriétaire:</strong> <span className="font-medium">{company.ownerID}</span></p>
                        <p className="col-span-full text-gray-300"><strong className="text-white">Nom de la Société:</strong> <span className="font-medium text-lg">{company.companyName}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Date d'Inscription:</strong> {company.dateInscri}</p>
                        <p className="text-gray-300"><strong className="text-white">Statut:</strong> 
                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                                company.status === 'PENDING' ? 'bg-yellow-900 text-yellow-300 border border-yellow-600' :
                                company.status === 'ACCEPTED' ? 'bg-green-900 text-green-300 border border-green-600' :
                                'bg-red-900 text-red-300 border border-red-600'
                            }`}>
                                {company.status}
                            </span>
                        </p>
                    </div>

                    {/* Boutons d'action */}
                    {company.status === 'PENDING' && (
                        <div className="flex gap-3 mt-4">
                            <Button 
                                variant="success"
                                onClick={() => setConfirmAction({
                                    companyId: company.companyId,
                                    status: 'ACCEPTED',
                                    companyName: company.companyName,
                                    ownerId: company.ownerID
                                })}
                                disabled={updating}
                                className="flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Accepter
                            </Button>
                            <Button 
                                variant="destructive"
                                onClick={() => setConfirmAction({
                                    companyId: company.companyId,
                                    status: 'REJECTED',
                                    companyName: company.companyName,
                                    ownerId: company.ownerID
                                })}
                                disabled={updating}
                                className="flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Refuser
                            </Button>
                        </div>
                    )}
                </section>

                {/* Validation */}
                <section>
                    <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-3 text-blue-400">Informations de Validation</h3>
                    {company.nomLegalComplet || company.numeroImmatriculation ? (
                        <div className="space-y-4 bg-gray-700 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <p className="text-gray-300"><strong className="text-white">Nom Légal Complet:</strong> {company.nomLegalComplet || 'N/A'}</p>
                                <p className="text-gray-300"><strong className="text-white">N° Immatriculation:</strong> <span className="font-mono">{company.numeroImmatriculation || 'N/A'}</span></p>
                                <p className="col-span-full text-gray-300"><strong className="text-white">Adresse Siège Social:</strong> {company.adresseSiegeSocial || 'N/A'}</p>
                                <p className="text-gray-300"><strong className="text-white">Président Légal:</strong> {company.nomPrenomPresidentLegal || 'N/A'}</p>
                                <p className="text-gray-300"><strong className="text-white">N° TVA/Taxe:</strong> <span className="font-mono">{company.numeroTvaTaxe || 'N/A'}</span></p>
                            </div>

                            <div className="pt-4">
                                <h4 className="font-semibold mb-3 text-gray-200">Documents Soumis:</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <DocumentButton 
                                        base64Data={company.certificatImmatriculation}
                                        label="Certificat d'Immatriculation"
                                        fileName="certificat_immatriculation.pdf"
                                    />
                                    <DocumentButton 
                                        base64Data={company.pieceIdentiteRepresentantLegal}
                                        label="Pièce d'Identité du Représentant Légal"
                                        fileName="piece_identite_representant.pdf"
                                    />
                                    <DocumentButton 
                                        base64Data={company.statutsSociete}
                                        label="Statuts de la Société"
                                        fileName="statuts_societe.pdf"
                                    />
                                    <DocumentButton 
                                        base64Data={company.justificatifDomiciliationCommerciale}
                                        label="Justificatif de Domiciliation Commerciale"
                                        fileName="justificatif_domiciliation.pdf"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-900/30 text-yellow-300 rounded-lg flex items-center border border-yellow-700">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <p className="italic">Aucune information de validation disponible</p>
                        </div>
                    )}
                </section>

                {/* État Financier - Bilan */}
                <section>
                    <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-3 text-blue-400">État Financier - Bilan</h3>
                    {company.actifTotal !== undefined || company.passifTotal !== undefined ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-gray-700 p-4 rounded-lg">
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                <p className="text-gray-400 text-xs mb-1">Actif Total</p>
                                <p className="font-bold text-base text-blue-400">{formatCurrency(company.actifTotal)}</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                <p className="text-gray-400 text-xs mb-1">Actif Immobilisé</p>
                                <p className="font-bold text-base text-gray-200">{formatCurrency(company.actifImmobilise)}</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                <p className="text-gray-400 text-xs mb-1">Actif Circulant</p>
                                <p className="font-bold text-base text-gray-200">{formatCurrency(company.actifCirculant)}</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                <p className="text-gray-400 text-xs mb-1">Passif Total</p>
                                <p className="font-bold text-base text-red-400">{formatCurrency(company.passifTotal)}</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                <p className="text-gray-400 text-xs mb-1">Capitaux Propres</p>
                                <p className="font-bold text-base text-green-400">{formatCurrency(company.capitauxPropres)}</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                <p className="text-gray-400 text-xs mb-1">Dettes</p>
                                <p className="font-bold text-base text-red-400">{formatCurrency(company.dettes)}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-900/30 text-yellow-300 rounded-lg flex items-center border border-yellow-700">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <p className="italic">Aucune donnée de bilan disponible</p>
                        </div>
                    )}
                </section>

                {/* Compte de Résultat */}
                <section>
                    <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-3 text-blue-400">Compte de Résultat</h3>
                    {company.chiffreAffaires !== undefined || company.resultatNet !== undefined ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-700 p-4 rounded-lg">
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                <p className="text-gray-400 text-xs mb-1">Chiffre d'Affaires</p>
                                <p className="font-bold text-base text-green-400">{formatCurrency(company.chiffreAffaires)}</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                <p className="text-gray-400 text-xs mb-1">Produits Total</p>
                                <p className="font-bold text-base text-gray-200">{formatCurrency(company.produitsTotal)}</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                <p className="text-gray-400 text-xs mb-1">Charges Total</p>
                                <p className="font-bold text-base text-orange-400">{formatCurrency(company.chargesTotal)}</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                <p className="text-gray-400 text-xs mb-1">Résultat Net</p>
                                <p className={`font-bold text-base ${(company.resultatNet ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatCurrency(company.resultatNet)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-900/30 text-yellow-300 rounded-lg flex items-center border border-yellow-700">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <p className="italic">Aucune donnée de résultat disponible</p>
                        </div>
                    )}
                </section>

                {/* Flux de Trésorerie */}
                <section>
                    <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-3 text-blue-400">Flux de Trésorerie</h3>
                    {company.fluxOperationnels !== undefined || company.variationNetteTresorerie !== undefined ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-700 p-4 rounded-lg">
                                <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                    <p className="text-gray-400 text-xs mb-1">Flux Opérationnels</p>
                                    <p className="font-bold text-base text-gray-200">{formatCurrency(company.fluxOperationnels)}</p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                    <p className="text-gray-400 text-xs mb-1">Flux Investissement</p>
                                    <p className="font-bold text-base text-gray-200">{formatCurrency(company.fluxInvestissement)}</p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                    <p className="text-gray-400 text-xs mb-1">Flux Financement</p>
                                    <p className="font-bold text-base text-gray-200">{formatCurrency(company.fluxFinancement)}</p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                                    <p className="text-gray-400 text-xs mb-1">Variation Nette</p>
                                    <p className={`font-bold text-base ${(company.variationNetteTresorerie ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatCurrency(company.variationNetteTresorerie)}
                                    </p>
                                </div>
                            </div>
                            
                            {company.rapportEtatFinancier && (
                                <DocumentButton 
                                    base64Data={company.rapportEtatFinancier}
                                    label="Rapport État Financier Complet"
                                    fileName="rapport_etat_financier.pdf"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-900/30 text-yellow-300 rounded-lg flex items-center border border-yellow-700">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <p className="italic">Aucune donnée de trésorerie disponible</p>
                        </div>
                    )}
                </section>
            </div>
        );
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-extrabold mb-2 text-blue-400">Tableau de Bord Administrateur</h1>
            <h2 className="text-2xl font-bold mb-4">Gestion des Sociétés</h2>
            <p className="text-gray-400 mb-8">
                Liste complète de toutes les sociétés enregistrées avec leurs informations détaillées.
            </p>

            {error && (
                <div className="p-4 mb-4 text-sm text-red-300 bg-red-900/50 rounded-lg flex items-center border border-red-700">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : companies.length === 0 ? (
                <Card className="border-yellow-700 bg-yellow-900/20">
                    <CardContent className="flex items-center p-6 text-yellow-300">
                        <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
                        <p className="font-medium">Aucune société trouvée dans la base de données.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {companies.map((company) => (
                        <Card key={company.companyId} className="hover:shadow-2xl hover:border-blue-600 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                                <div className="flex flex-col flex-1">
                                    <CardTitle className="text-xl font-bold">{company.companyName}</CardTitle>
                                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                                        <span>ID: {company.companyId}</span>
                                        <span>•</span>
                                        <span>N° Immatriculation: {company.numeroImmatriculation || 'N/A'}</span>
                                        <span>•</span>
                                        <span>Inscrit le: {company.dateInscri}</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                    <span className={`text-sm font-medium px-3 py-1 rounded-full border ${
                                        company.status === 'PENDING' ? 'text-yellow-300 bg-yellow-900/50 border-yellow-600' :
                                        company.status === 'ACCEPTED' ? 'text-green-300 bg-green-900/50 border-green-600' :
                                        'text-red-300 bg-red-900/50 border-red-600'
                                    }`}>
                                        {company.status}
                                    </span>
                                    <Button 
                                        onClick={() => fetchCompanyDetails(company.companyId)}
                                        disabled={loadingDetails}
                                        variant="outline"
                                        className="text-blue-400 border-blue-600 hover:bg-blue-900/30"
                                    >
                                        Voir Détails
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal pour les détails complets */}
            <Dialog 
                open={selectedCompany !== null} 
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedCompany(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedCompany?.companyName || 'Détails de la Société'}</DialogTitle>
                        <DialogDescription>
                            Informations complètes incluant validation, états financiers et documents binaires.
                        </DialogDescription>
                    </DialogHeader>
                    {renderDetailsContent()}
                </DialogContent>
            </Dialog>

            {/* Modal de confirmation */}
            {confirmAction && !showStockForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            confirmAction.status === 'ACCEPTED' 
                                ? 'bg-green-900/30 border-2 border-green-500' 
                                : 'bg-red-900/30 border-2 border-red-500'
                        }`}>
                            {confirmAction.status === 'ACCEPTED' ? (
                                <Check className="w-8 h-8 text-green-400" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-400" />
                            )}
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-3 text-center text-white">
                            {confirmAction.status === 'ACCEPTED' ? 'Accepter cette société ?' : 'Refuser cette société ?'}
                        </h3>
                        
                        <p className="text-gray-400 mb-2 text-center">
                            Vous êtes sur le point de {confirmAction.status === 'ACCEPTED' ? 'accepter' : 'refuser'} la demande de :
                        </p>
                        
                        <p className="text-xl font-bold text-white mb-6 text-center bg-gray-700 py-3 px-4 rounded-lg">
                            {confirmAction.companyName}
                        </p>
                        
                        <div className={`p-4 rounded-lg mb-6 ${
                            confirmAction.status === 'ACCEPTED' 
                                ? 'bg-green-900/20 border border-green-700' 
                                : 'bg-red-900/20 border border-red-700'
                        }`}>
                            <p className={`text-sm ${
                                confirmAction.status === 'ACCEPTED' ? 'text-green-300' : 'text-red-300'
                            }`}>
                                {confirmAction.status === 'ACCEPTED' 
                                    ? '✓ La société aura accès à toutes les fonctionnalités de la plateforme' 
                                    : '⚠ La demande sera refusée et la société en sera notifiée'}
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            {confirmAction.status === 'ACCEPTED' ? (
                                <Button 
                                    variant="success"
                                    onClick={() => setShowStockForm(true)}
                                    disabled={updating}
                                    className="flex-1 py-3 text-lg justify-center"
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    Continuer
                                </Button>
                            ) : (
                                <Button 
                                    variant="destructive"
                                    onClick={() => updateCompanyStatus(confirmAction.companyId, confirmAction.status)}
                                    disabled={updating}
                                    className="flex-1 py-3 text-lg justify-center"
                                >
                                    {updating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Traitement...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5 mr-2" />
                                            Confirmer le refus
                                        </>
                                    )}
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                onClick={() => setConfirmAction(null)}
                                disabled={updating}
                                className="flex-1 py-3 text-lg justify-center"
                            >
                                <X className="w-5 h-5 mr-2" />
                                Annuler
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulaire de création de stock */}
            {confirmAction && showStockForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto p-4">
                    <div className="bg-gray-800 border-2 border-blue-600 rounded-2xl p-8 max-w-2xl w-full my-8 shadow-2xl">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-900/30 border-2 border-blue-500">
                            <FileText className="w-10 h-10 text-blue-400" />
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-2 text-center text-white">
                            Configuration du Stock Initial
                        </h3>
                        
                        <p className="text-gray-400 mb-6 text-center">
                            Définissez les paramètres du stock pour <span className="text-blue-400 font-semibold">{confirmAction.companyName}</span>
                        </p>
                        
                        <form className="space-y-5">
                            {/* Nom du Stock */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Nom du Stock <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={stockFormData.nomStock}
                                    onChange={(e) => setStockFormData({...stockFormData, nomStock: e.target.value})}
                                    placeholder={`Ex: Stock ${confirmAction.companyName}`}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Suggestion: Stock {confirmAction.companyName}
                                </p>
                            </div>

                            {/* ID Compagnie (lecture seule) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    ID Compagnie
                                </label>
                                <input
                                    type="text"
                                    value={confirmAction.companyId}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                                />
                            </div>

                            {/* Nom de la Compagnie (lecture seule) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Nom de la Compagnie
                                </label>
                                <input
                                    type="text"
                                    value={confirmAction.companyName}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Stock Disponible */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Stock Disponible <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={stockFormData.stockDisponible}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setStockFormData({
                                                ...stockFormData, 
                                                stockDisponible: value,
                                                stockReste: stockFormData.stockReste || value
                                            });
                                        }}
                                        placeholder="Ex: 1000"
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>

                                {/* Stock Restant */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Stock Restant
                                    </label>
                                    <input
                                        type="number"
                                        value={stockFormData.stockReste}
                                        onChange={(e) => setStockFormData({...stockFormData, stockReste: e.target.value})}
                                        placeholder="Auto-rempli"
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Par défaut = Stock disponible
                                    </p>
                                </div>
                            </div>

                            {/* Prix du Stock */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Prix Unitaire (€) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={stockFormData.prixStock}
                                    onChange={(e) => setStockFormData({...stockFormData, prixStock: e.target.value})}
                                    placeholder="Ex: 25.50"
                                    min="0"
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* État */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    État du Stock
                                </label>
                                <select
                                    value={stockFormData.etat}
                                    onChange={(e) => setStockFormData({...stockFormData, etat: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                >
                                    <option value="DISPONIBLE">Disponible</option>
                                    <option value="RUPTURE">Rupture de stock</option>
                                    <option value="EN_ATTENTE">En attente</option>
                                </select>
                            </div>

                            {/* Résumé */}
                            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-blue-300 mb-2">📊 Résumé</h4>
                                <div className="space-y-1 text-sm text-gray-300">
                                    <p>• <strong>Stock:</strong> {stockFormData.nomStock || 'Non défini'}</p>
                                    <p>• <strong>Quantité:</strong> {stockFormData.stockDisponible || '0'} unités</p>
                                    <p>• <strong>Prix:</strong> {stockFormData.prixStock ? `${parseFloat(stockFormData.prixStock).toFixed(2)} €` : '0.00 €'}</p>
                                    <p>• <strong>Valeur totale:</strong> {stockFormData.stockDisponible && stockFormData.prixStock 
                                        ? `${(parseFloat(stockFormData.stockDisponible) * parseFloat(stockFormData.prixStock)).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'})}` 
                                        : '0.00 €'}</p>
                                </div>
                            </div>
                        </form>
                        
                        <div className="flex gap-3 mt-6">
                            <Button 
                                variant="success"
                                onClick={() => updateCompanyStatus(confirmAction.companyId, 'ACCEPTED')}
                                disabled={updating || !stockFormData.nomStock || !stockFormData.stockDisponible || !stockFormData.prixStock}
                                className="flex-1 py-3 text-lg justify-center"
                            >
                                {updating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Traitement en cours...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        Valider & Accepter
                                    </>
                                )}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShowStockForm(false);
                                    setStockFormData({
                                        nomStock: '',
                                        stockDisponible: '',
                                        stockReste: '',
                                        prixStock: '',
                                        etat: 'DISPONIBLE'
                                    });
                                }}
                                disabled={updating}
                                className="py-3 text-lg"
                            >
                                <X className="w-5 h-5 mr-2" />
                                Retour
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal pour visualiser les images */}
            {viewingImage && (
                <div 
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={() => setViewingImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] p-4">
                        <button
                            className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
                            onClick={() => setViewingImage(null)}
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <img 
                            src={viewingImage} 
                            alt="Document" 
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;