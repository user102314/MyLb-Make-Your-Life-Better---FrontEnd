// src/lib/Confidentiality.tsx (ou où que vous placiez le fichier)

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Shield, AlertTriangle, KeyRound, User, LogIn, XCircle } from 'lucide-react';

// --- Interfaces ---
type ActionType = 'SECURITY_ALERT' | 'PASSWORD_CHANGE' | 'LOGIN_SUCCESS' | 'PROFILE_UPDATE';

interface ClientAction {
    actionId: number;
    actionType: ActionType;
    actionDate: string; 
    details: string;
}
// ------------------

// VÉRIFIEZ CE PORT AVEC VOTRE BACKEND JAVA
const API_HISTORY_URL = "http://localhost:9090/api/actions/history"; 

// Helper pour formater les données et les icônes
const formatAction = (actionType: ActionType) => {
    switch (actionType) {
        case 'SECURITY_ALERT':
            return { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, label: 'Alerte de Sécurité' };
        case 'PASSWORD_CHANGE':
        // ... (autres types)
        case 'LOGIN_SUCCESS':
            return { icon: <LogIn className="w-4 h-4 text-green-500" />, label: 'Connexion Réussie' };
        case 'PROFILE_UPDATE':
            return { icon: <User className="w-4 h-4 text-blue-500" />, label: 'Mise à Jour Profil' };
        default:
            return { icon: <Shield className="w-4 h-4 text-gray-500" />, label: 'Autre Action' };
    }
};

const Confidentiality: React.FC = () => {
    const [actions, setActions] = useState<ClientAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null); // Réinitialiser l'erreur
            
            try {
                const response = await fetch(API_HISTORY_URL, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (!response.ok) {
                    // Logique d'erreur plus précise
                    if (response.status === 401 || response.status === 403) {
                        throw new Error("Erreur 401/403: Session expirée ou non autorisée. Veuillez vous reconnecter.");
                    }
                    if (response.status === 404) {
                        throw new Error("Erreur 404: Endpoint API non trouvé. Vérifiez l'URL du contrôleur Java.");
                    }
                    if (response.status >= 500) {
                        throw new Error(`Erreur Serveur ${response.status}: Veuillez contacter l'administrateur.`);
                    }
                    
                    const errorText = await response.text();
                    throw new Error(`Erreur ${response.status}: ${errorText || 'Échec de la récupération.'}`);
                }

                const data: ClientAction[] = await response.json();
                setActions(data);

            } catch (err) {
                // Gestion des erreurs réseau (CORS, API down, etc.)
                let message = "Impossible de contacter l'API Java (Vérifiez la connexion ou le port CORS :8081 ↔ :9090).";
                if (err instanceof Error) {
                    message = err.message;
                }
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDateTime = (isoString: string) => {
        try {
            // Assure le parsing correct des chaînes LocalDateTime ISO 8601
            return new Date(isoString).toLocaleString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return isoString;
        }
    };

    const renderContent = () => {
        // ... (Logique d'affichage loading)
        if (loading) {
            return (
                <div className="flex justify-center items-center py-10 text-primary">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Chargement de l'historique...
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-100 text-red-700 p-4 rounded-md mt-4 flex items-center gap-3">
                    <XCircle className="w-5 h-5" />
                    <div>
                        <p className="font-semibold">Erreur de chargement :</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            );
        }

        // ... (Logique d'affichage actions.length === 0)
        if (actions.length === 0) {
            return (
                <div className="text-center py-10 text-muted-foreground">
                    Aucune action récente n'a été enregistrée pour votre compte.
                </div>
            );
        }

        // ... (Rendu du tableau)
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">Date & Heure</TableHead>
                        <TableHead>Type d'Action</TableHead>
                        <TableHead>Détails</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {actions.map((action) => {
                        const { icon, label } = formatAction(action.actionType);
                        
                        return (
                            <TableRow key={action.actionId} className={action.actionType === 'SECURITY_ALERT' ? 'bg-red-50/50 hover:bg-red-100' : ''}>
                                <TableCell className="font-medium text-xs">
                                    {formatDateTime(action.actionDate)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        {icon}
                                        {label}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {action.details}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <Card className="shadow-xl">
                <CardHeader className="border-b">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-primary">
                        <Shield className="w-6 h-6" /> Historique de Confidentialité et Sécurité
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Cette page liste toutes les actions importantes (connexions, modifications, alertes) effectuées sur votre compte.
                    </p>
                </CardHeader>

                <CardContent className="p-0">
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default Confidentiality;