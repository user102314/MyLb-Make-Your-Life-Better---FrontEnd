// src/pages/ViewWallet.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, Download, Upload, User, Mail, ArrowRight, Wallet, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API_WALLET_URL = "http://localhost:9090/api/wallets";
const API_CARDS_URL = "http://localhost:9090/api/cards";
const API_AUTH_CHECK_URL = "http://localhost:9090/api/client/name";

interface WalletData {
  id: number;
  idClient: number;
  sold: number;
}

interface CardData {
  id: number;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  sold: number;
  cardType: string;
  dailyLimit: number;
}

const ViewWallet: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [clientId, setClientId] = useState<number | null>(null);

  // États pour les retraits
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [withdrawType, setWithdrawType] = useState<'card' | 'user'>('card');

  // États pour les dépôts
  const [depositAmount, setDepositAmount] = useState('');

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const authResponse = await fetch(API_AUTH_CHECK_URL, { 
          credentials: 'include' 
        });
        
        if (authResponse.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        
        if (authResponse.ok) {
          const storedClientId = localStorage.getItem('clientId') || '1';
          setClientId(parseInt(storedClientId));
        }
      } catch (err) {
        console.error('Authentication error:', err);
      }
    };

    checkAuthentication();
  }, [navigate]);

  // Charger les données
  const fetchData = async () => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Charger le wallet
      const walletResponse = await fetch(`${API_WALLET_URL}/${clientId}/solde`, {
        credentials: 'include'
      });
      
      if (!walletResponse.ok) throw new Error('Erreur lors du chargement du wallet');
      
      const walletData = await walletResponse.json();
      setWallet({
        id: walletData.id || 0,
        idClient: clientId,
        sold: walletData.solde || 0
      });

      // Charger les cartes
      const cardsResponse = await fetch(`${API_CARDS_URL}/client/${clientId}`, {
        credentials: 'include'
      });
      
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        setCards(cardsData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  // Effectuer un retrait vers carte
  const handleWithdrawToCard = async () => {
    if (!clientId || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || !selectedCardId) {
      setError('Veuillez remplir tous les champs');
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
      // 1. Retirer du wallet
      const walletResponse = await fetch(`${API_WALLET_URL}/${clientId}/modifier-solde`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nouveauSold: (wallet?.sold || 0) - amount })
      });

      if (!walletResponse.ok) throw new Error('Erreur lors du retrait du wallet');

      // 2. Ajouter à la carte
      const cardResponse = await fetch(`${API_CARDS_URL}/${selectedCardId}/ajouter-solde`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ montant: amount })
      });

      if (!cardResponse.ok) throw new Error('Erreur lors de l\'ajout à la carte');

      setSuccessMessage(`Retrait de ${amount} DT vers la carte effectué avec succès`);
      setWithdrawAmount('');
      setSelectedCardId('');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du retrait');
    } finally {
      setProcessing(false);
    }
  };

  // Effectuer un retrait vers utilisateur
  const handleWithdrawToUser = async () => {
    if (!clientId || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || !recipientEmail) {
      setError('Veuillez remplir tous les champs');
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
      // Ici vous devriez appeler votre API pour transférer vers un autre utilisateur
      // Pour l'exemple, on simule le transfert
      
      // 1. Retirer du wallet actuel
      const walletResponse = await fetch(`${API_WALLET_URL}/${clientId}/modifier-solde`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nouveauSold: (wallet?.sold || 0) - amount })
      });

      if (!walletResponse.ok) throw new Error('Erreur lors du retrait');

      // NOTE: Dans une vraie application, vous auriez un endpoint pour transférer vers un autre utilisateur
      // API: POST /api/wallets/transfer { fromClientId, toEmail, amount }

      setSuccessMessage(`Transfert de ${amount} DT vers ${recipientEmail} effectué avec succès`);
      setWithdrawAmount('');
      setRecipientEmail('');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du transfert');
    } finally {
      setProcessing(false);
    }
  };

  // Effectuer un dépôt
  const handleDeposit = async () => {
    if (!clientId || !depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Montant invalide');
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const response = await fetch(`${API_WALLET_URL}/${clientId}/recharger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ montant: parseFloat(depositAmount) })
      });

      if (!response.ok) throw new Error('Erreur lors du dépôt');

      setSuccessMessage(`Dépôt de ${depositAmount} DT effectué avec succès`);
      setDepositAmount('');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du dépôt');
    } finally {
      setProcessing(false);
    }
  };

  // Formater le numéro de carte
  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  // Formater le solde
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
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
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-900/20 border-green-800">
            <AlertDescription className="text-green-400">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte Bancaire Principale */}
          <div className="lg:col-span-2">
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
                    <p className="text-blue-200 text-sm">Client ID</p>
                    <p className="text-xl font-mono">{clientId}</p>
                  </div>
                  <Wallet className="w-12 h-12 text-white/60" />
                </div>
              </CardContent>
            </Card>

            {/* Actions Rapides */}
            <Tabs defaultValue="deposit" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="deposit" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Dépôt
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="flex items-center gap-2">
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
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300">Destination</label>
                      <Select value={withdrawType} onValueChange={(value: 'card' | 'user') => setWithdrawType(value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Vers une Carte
                            </div>
                          </SelectItem>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Vers un Utilisateur
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {withdrawType === 'card' && (
                      <div>
                        <label className="text-sm font-medium text-slate-300">Sélectionner la Carte</label>
                        <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                            <SelectValue placeholder="Choisir une carte" />
                          </SelectTrigger>
                          <SelectContent>
                            {cards.map((card) => (
                              <SelectItem key={card.id} value={card.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-4 h-4" />
                                  {formatCardNumber(card.cardNumber)} - {card.cardType}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

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
                      onClick={withdrawType === 'card' ? handleWithdrawToCard : handleWithdrawToUser}
                      disabled={processing || !withdrawAmount || (withdrawType === 'card' && !selectedCardId) || (withdrawType === 'user' && !recipientEmail)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {processing ? 'Traitement...' : 'Effectuer le Retrait'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Cartes Disponibles */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Mes Cartes
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {cards.length} carte(s) disponible(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cards.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune carte disponible</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/cards')}
                    >
                      Ajouter une Carte
                    </Button>
                  </div>
                ) : (
                  cards.map((card) => (
                    <div key={card.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-white">{formatCardNumber(card.cardNumber)}</p>
                          <p className="text-sm text-slate-300">{card.cardHolderName}</p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                          {card.cardType}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Expire: {card.expiryDate}</span>
                        <span className="font-bold text-green-400">{card.sold} DT</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => navigate('/dashboard/cards')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gérer les Cartes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewWallet;