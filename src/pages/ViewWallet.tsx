// src/pages/ViewWallet.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, Download, Upload, User, Wallet, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE_URL = "http://localhost:9090/api";
const API_WALLET_URL = `${API_BASE_URL}/wallets`;
const API_AUTH_CHECK_URL = `${API_BASE_URL}/client/name`;

interface WalletData {
  id: number;
  idClient: number;
  sold: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const ViewWallet: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // États pour les retraits
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [withdrawType, setWithdrawType] = useState<'card' | 'user'>('card');

  // États pour les dépôts
  const [depositAmount, setDepositAmount] = useState('');

  // Fonction utilitaire pour les appels API
  const apiCall = async <T,>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const defaultOptions: RequestInit = {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (err) {
      console.error(`API Error [${url}]:`, err);
      return { 
        error: err instanceof Error ? err.message : 'Unknown error occurred' 
      };
    }
  };

  // Vérifier l'authentification
  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch(API_AUTH_CHECK_URL, {
        credentials: 'include'
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Charger le wallet - CORRECTION: utiliser GET /solde au lieu de POST /create
  const fetchWallet = async (): Promise<void> => {
    const { data, error } = await apiCall<{ solde: number }>(`${API_WALLET_URL}/solde`, {
      method: 'GET'
    });

    if (error) {
      setError(`Erreur wallet: ${error}`);
      return;
    }

    if (data) {
      setWallet({
        id: 0, // L'ID n'est pas retourné par l'endpoint /solde
        idClient: 0, // Géré par la session
        sold: data.solde || 0
      });
    }
  };

  // Charger toutes les données
  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Vérifier l'authentification
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }

      // Charger le wallet
      await fetchWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Recharger les données
  const refreshData = async (): Promise<void> => {
    setError(null);
    await fetchWallet();
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Effectuer un dépôt
  const handleDeposit = async (): Promise<void> => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Montant invalide');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error } = await apiCall<WalletData>(`${API_WALLET_URL}/recharger`, {
        method: 'POST',
        body: JSON.stringify({ montant: parseFloat(depositAmount) })
      });

      if (error) {
        setError(`Erreur dépôt: ${error}`);
        return;
      }

      setSuccessMessage(`Dépôt de ${depositAmount} DT effectué avec succès`);
      setDepositAmount('');
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du dépôt');
    } finally {
      setProcessing(false);
    }
  };

  // Effectuer un retrait
  const handleWithdraw = async (): Promise<void> => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Montant invalide');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > (wallet?.sold || 0)) {
      setError('Solde insuffisant');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const newBalance = (wallet?.sold || 0) - amount;
      const { error } = await apiCall<WalletData>(`${API_WALLET_URL}/modifier-solde`, {
        method: 'PUT',
        body: JSON.stringify({ nouveauSold: newBalance })
      });

      if (error) {
        setError(`Erreur retrait: ${error}`);
        return;
      }

      let message = `Retrait de ${amount} DT effectué avec succès`;
      
      if (withdrawType === 'user' && recipientEmail) {
        message += ` vers ${recipientEmail}`;
      }

      setSuccessMessage(message);
      setWithdrawAmount('');
      setRecipientEmail('');
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du retrait');
    } finally {
      setProcessing(false);
    }
  };

  // Formater le solde
  const formatBalance = (amount: number): string => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  // Réinitialiser les messages
  const clearMessages = (): void => {
    setError(null);
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement du portefeuille...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mon Portefeuille</h1>
          <p className="text-slate-300">Gérez vos finances en toute sécurité</p>
        </div>

        {/* Messages d'alerte */}
        <div className="mb-6 space-y-2">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-800">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-900/20 border-green-800">
              <AlertDescription className="text-green-400">{successMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Bouton de rafraîchissement */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={refreshData}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte Principale */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 border-0 text-white shadow-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      Portefeuille Principal
                    </Badge>
                    <p className="text-blue-200 text-sm mt-1">MyLb Wallet</p>
                  </div>
                  <Shield className="w-8 h-8 text-white/80" />
                </div>

                <div className="mb-8">
                  <p className="text-blue-200 text-sm mb-2">Solde Disponible</p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-bold">
                      {showBalance ? (
                        `${formatBalance(wallet?.sold || 0)} DT`
                      ) : (
                        '•••••• DT'
                      )}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-white/80 hover:text-white hover:bg-white/20"
                    >
                      {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-200 text-sm">Statut</p>
                    <p className="text-xl font-mono">
                      {wallet ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                  <Wallet className="w-12 h-12 text-white/60" />
                </div>
              </CardContent>
            </Card>

            {/* Actions Rapides */}
            <Tabs defaultValue="deposit" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger 
                  value="deposit" 
                  className="flex items-center gap-2"
                  onClick={clearMessages}
                >
                  <Download className="w-4 h-4" />
                  Dépôt
                </TabsTrigger>
                <TabsTrigger 
                  value="withdraw" 
                  className="flex items-center gap-2"
                  onClick={clearMessages}
                >
                  <Upload className="w-4 h-4" />
                  Retrait
                </TabsTrigger>
              </TabsList>

              {/* Dépôt */}
              <TabsContent value="deposit">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Dépôt vers le Portefeuille
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Ajouter des fonds à votre portefeuille
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Montant (DT)</label>
                      <Input
                        type="number"
                        placeholder="0.000"
                        step="0.001"
                        min="0.001"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <Button 
                      onClick={handleDeposit}
                      disabled={processing || !depositAmount}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {processing ? 'Traitement...' : 'Effectuer le Dépôt'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Retrait */}
              <TabsContent value="withdraw">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Retrait du Portefeuille
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Retirer des fonds de votre portefeuille
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Montant (DT)</label>
                      <Input
                        type="number"
                        placeholder="0.000"
                        step="0.001"
                        min="0.001"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300">Type de Retrait</label>
                      <Select 
                        value={withdrawType} 
                        onValueChange={(value: 'card' | 'user') => setWithdrawType(value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Vers un Utilisateur
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {withdrawType === 'user' && (
                      <div>
                        <label className="text-sm font-medium text-slate-300">Email du Destinataire</label>
                        <Input
                          type="email"
                          placeholder="utilisateur@email.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                      </div>
                    )}

                    <Button 
                      onClick={handleWithdraw}
                      disabled={
                        processing || 
                        !withdrawAmount || 
                        (withdrawType === 'user' && !recipientEmail)
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {processing ? 'Traitement...' : 'Effectuer le Retrait'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewWallet;