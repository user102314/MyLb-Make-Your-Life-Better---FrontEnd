// src/pages/ViewCards.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Wallet, ArrowRight, Shield, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_CARDS_URL = "http://localhost:9090/api/cards";
const API_WALLET_URL = "http://localhost:9090/api/wallets";
const API_AUTH_CHECK_URL = "http://localhost:9090/api/client/name";

interface CardData {
  id: number;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  sold: number;
  idClient: number;
  isActive: boolean;
  cardType: string;
  dailyLimit: number;
}

interface ValidationErrors {
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
}

const ViewCards: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  // États pour l'ajout de carte
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    cardType: 'VISA'
  });

  // États pour la validation
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // États pour l'ajout de solde au wallet
  const [showAddToWallet, setShowAddToWallet] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [transferAmount, setTransferAmount] = useState('');

  // Fonction utilitaire pour les appels API
  const apiCall = async <T,>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T | null> => {
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

      return await response.json();
    } catch (err) {
      console.error(`API Error [${url}]:`, err);
      return null;
    }
  };

  // Vérifier l'authentification et charger les données
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Vérifier l'authentification
      const authResponse = await fetch(API_AUTH_CHECK_URL, { 
        credentials: 'include' 
      });
      
      if (authResponse.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      // Charger les cartes (NOUVEL ENDPOINT)
      const cardsData = await apiCall<CardData[]>(`${API_CARDS_URL}`);
      if (cardsData) {
        setCards(cardsData);
      } else {
        setCards([]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des cartes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Validation des champs de carte
  const validateCardField = (field: string, value: string): string => {
    switch (field) {
      case 'cardNumber':
        const cleanCardNumber = value.replace(/\s/g, '');
        if (!cleanCardNumber) return 'Le numéro de carte est requis';
        if (cleanCardNumber.length !== 16) return 'Le numéro doit contenir 16 chiffres';
        if (!/^\d+$/.test(cleanCardNumber)) return 'Le numéro ne doit contenir que des chiffres';
        return '';

      case 'cardHolderName':
        if (!value.trim()) return 'Le nom du titulaire est requis';
        if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        return '';

      case 'expiryDate':
        if (!value) return 'La date d\'expiration est requise';
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) return 'Format invalide (MM/AA)';
        
        const [month, year] = value.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const currentDate = new Date();
        if (expiryDate < currentDate) return 'La carte a expiré';
        return '';

      case 'cvv':
        if (!value) return 'Le CVV est requis';
        if (value.length !== 3) return 'Le CVV doit contenir 3 chiffres';
        if (!/^\d+$/.test(value)) return 'Le CVV ne doit contenir que des chiffres';
        return '';

      default:
        return '';
    }
  };

  // Validation du formulaire complet
  const isFormValid = () => {
    const cardNumberValid = validateCardField('cardNumber', newCard.cardNumber) === '';
    const cardHolderValid = validateCardField('cardHolderName', newCard.cardHolderName) === '';
    const expiryDateValid = validateCardField('expiryDate', newCard.expiryDate) === '';
    const cvvValid = validateCardField('cvv', newCard.cvv) === '';
    
    return cardNumberValid && cardHolderValid && expiryDateValid && cvvValid;
  };

  // Validation du transfert
  const validateTransfer = (): string => {
    if (!selectedCardId) return 'Veuillez sélectionner une carte';
    if (!transferAmount) return 'Le montant est requis';
    
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) return 'Le montant doit être supérieur à 0';
    if (amount > 100000) return 'Le montant ne peut pas dépasser 100,000 DT';
    
    const selectedCard = cards.find(card => card.id === selectedCardId);
    if (!selectedCard) return 'Carte non trouvée';
    if (amount > selectedCard.sold) return 'Solde insuffisant sur la carte';
    
    return '';
  };

  // Gestion du changement de champ avec validation
  const handleFieldChange = (field: string, value: string) => {
    setNewCard(prev => ({ ...prev, [field]: value }));
    
    // Validation après un délai pour éviter les re-renders excessifs
    setTimeout(() => {
      const error = validateCardField(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }, 300);
  };

  // Ajouter une nouvelle carte
  const handleAddCard = async () => {
    // Validation finale avant envoi
    const errors: ValidationErrors = {};
    errors.cardNumber = validateCardField('cardNumber', newCard.cardNumber);
    errors.cardHolderName = validateCardField('cardHolderName', newCard.cardHolderName);
    errors.expiryDate = validateCardField('expiryDate', newCard.expiryDate);
    errors.cvv = validateCardField('cvv', newCard.cvv);

    setValidationErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setProcessing(true);
    setError(null);
    
    try {
      const cardData = {
        cardNumber: newCard.cardNumber.replace(/\s/g, ''),
        cardHolderName: newCard.cardHolderName.toUpperCase().trim(),
        expiryDate: newCard.expiryDate,
        cvv: newCard.cvv,
        cardType: newCard.cardType
        // idClient est maintenant géré par la session dans le backend
      };

      const response = await apiCall<CardData>(API_CARDS_URL, {
        method: 'POST',
        body: JSON.stringify(cardData)
      });

      if (response) {
        setSuccessMessage('✅ Carte ajoutée avec succès');
        setShowAddCard(false);
        setNewCard({
          cardNumber: '',
          cardHolderName: '',
          expiryDate: '',
          cvv: '',
          cardType: 'VISA'
        });
        setValidationErrors({});
        
        // Recharger la liste des cartes
        await fetchData();
      } else {
        throw new Error('Erreur lors de l\'ajout de la carte');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la carte';
      setError(`❌ ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  // Transférer du solde vers le wallet (NOUVEL ENDPOINT)
  const handleTransferToWallet = async () => {
    const transferError = validateTransfer();
    if (transferError) {
      setError(transferError);
      return;
    }

    if (!selectedCardId) return;

    const amount = parseFloat(transferAmount);
    setProcessing(true);
    setError(null);
    
    try {
      // Utiliser le nouvel endpoint de transfert
      const response = await apiCall<CardData>(`${API_CARDS_URL}/${selectedCardId}/transfer-to-wallet`, {
        method: 'PUT',
        body: JSON.stringify({ montant: amount })
      });

      if (response) {
        setSuccessMessage(`✅ Transfert de ${amount.toFixed(3)} DT effectué avec succès`);
        setShowAddToWallet(false);
        setTransferAmount('');
        setSelectedCardId(null);
        
        // Recharger les données
        await fetchData();
      } else {
        throw new Error('Erreur lors du transfert');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du transfert';
      setError(`❌ ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  // Désactiver une carte
  const handleDeactivateCard = async (cardId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cette carte ? Cette action est irréversible.')) {
      return;
    }

    setProcessing(true);
    setError(null);
    
    try {
      const response = await apiCall<CardData>(`${API_CARDS_URL}/${cardId}/desactiver`, {
        method: 'PUT'
      });

      if (response) {
        setSuccessMessage('✅ Carte désactivée avec succès');
        await fetchData();
      } else {
        throw new Error('Erreur lors de la désactivation');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la désactivation';
      setError(`❌ ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  // Formater le numéro de carte masqué
  const formatCardNumberMasked = (number: string): string => {
    if (!number) return '•••• •••• •••• ••••';
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length < 12) return '•••• •••• •••• ••••';
    return `**** **** **** ${cleaned.substring(12)}`;
  };

  // Formater le solde
  const formatBalance = (amount: number): string => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewCard({
      cardNumber: '',
      cardHolderName: '',
      expiryDate: '',
      cvv: '',
      cardType: 'VISA'
    });
    setValidationErrors({});
    setError(null);
  };

  // Effacer les messages après un délai
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de vos cartes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mes Cartes Bancaires</h1>
          <p className="text-slate-300">Gérez vos cartes et transférez des fonds vers votre wallet</p>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-900/20 border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des Cartes */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Vos Cartes</h2>
              <Dialog open={showAddCard} onOpenChange={(open) => {
                setShowAddCard(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Carte
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle>Ajouter une Carte</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Saisissez les informations de votre carte bancaire
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {/* Numéro de Carte */}
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-slate-300">
                        Numéro de Carte *
                      </Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={newCard.cardNumber}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 16) value = value.substring(0, 16);
                          value = value.replace(/(\d{4})/g, '$1 ').trim();
                          handleFieldChange('cardNumber', value);
                        }}
                        className={`bg-slate-700 border-slate-600 text-white ${
                          validationErrors.cardNumber ? 'border-red-500' : ''
                        }`}
                        maxLength={19}
                      />
                      {validationErrors.cardNumber && (
                        <p className="text-red-400 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.cardNumber}
                        </p>
                      )}
                    </div>

                    {/* Nom du Titulaire */}
                    <div className="space-y-2">
                      <Label htmlFor="cardHolderName" className="text-slate-300">
                        Nom du Titulaire *
                      </Label>
                      <Input
                        id="cardHolderName"
                        placeholder="JOHN DOE"
                        value={newCard.cardHolderName}
                        onChange={(e) => handleFieldChange('cardHolderName', e.target.value)}
                        className={`bg-slate-700 border-slate-600 text-white ${
                          validationErrors.cardHolderName ? 'border-red-500' : ''
                        }`}
                      />
                      {validationErrors.cardHolderName && (
                        <p className="text-red-400 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.cardHolderName}
                        </p>
                      )}
                    </div>

                    {/* Date d'expiration et CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="text-slate-300">
                          Expiration *
                        </Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/AA"
                          value={newCard.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length > 2) {
                              value = value.substring(0, 2) + '/' + value.substring(2, 4);
                            }
                            handleFieldChange('expiryDate', value);
                          }}
                          className={`bg-slate-700 border-slate-600 text-white ${
                            validationErrors.expiryDate ? 'border-red-500' : ''
                          }`}
                          maxLength={5}
                        />
                        {validationErrors.expiryDate && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.expiryDate}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-slate-300">
                          CVV *
                        </Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={newCard.cvv}
                          onChange={(e) => handleFieldChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 3))}
                          className={`bg-slate-700 border-slate-600 text-white ${
                            validationErrors.cvv ? 'border-red-500' : ''
                          }`}
                          maxLength={3}
                        />
                        {validationErrors.cvv && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.cvv}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Type de Carte */}
                    <div className="space-y-2">
                      <Label htmlFor="cardType" className="text-slate-300">
                        Type de Carte *
                      </Label>
                      <Select
                        value={newCard.cardType}
                        onValueChange={(value) => setNewCard(prev => ({ ...prev, cardType: value }))}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VISA">VISA</SelectItem>
                          <SelectItem value="MASTERCARD">MasterCard</SelectItem>
                          <SelectItem value="AMEX">American Express</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddCard(false);
                        resetForm();
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleAddCard}
                      disabled={processing || !isFormValid()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Ajout en cours...
                        </>
                      ) : (
                        'Ajouter la Carte'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {cards.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold text-white mb-2">Aucune carte</h3>
                  <p className="text-slate-400 mb-4">Commencez par ajouter votre première carte bancaire</p>
                  <Button 
                    onClick={() => setShowAddCard(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une carte
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card) => (
                  <Card key={card.id} className="bg-gradient-to-br from-blue-600 to-purple-700 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge variant="secondary" className="bg-white/20 text-white border-0 mb-2">
                            {card.cardType}
                          </Badge>
                          <p className="text-blue-200 text-sm">{card.cardHolderName}</p>
                        </div>
                        <Shield className="w-6 h-6 text-white/60" />
                      </div>

                      <div className="mb-4">
                        <p className="text-blue-200 text-sm mb-1">Numéro de Carte</p>
                        <p className="text-xl font-mono tracking-wider font-bold">
                          {formatCardNumberMasked(card.cardNumber)}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-blue-200 text-sm">Expire le</p>
                          <p className="font-semibold">{card.expiryDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-200 text-sm">Solde</p>
                          <p className="font-bold text-lg text-green-300">
                            {formatBalance(card.sold)} DT
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                          onClick={() => {
                            setSelectedCardId(card.id);
                            setShowAddToWallet(true);
                          }}
                          disabled={processing || card.sold <= 0}
                        >
                          <Wallet className="w-4 h-4 mr-1" />
                          Vers Wallet
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                          onClick={() => handleDeactivateCard(card.id)}
                          disabled={processing}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Actions Latérales */}
          <div className="space-y-6">
            {/* Transfert vers Wallet */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Recharger le Wallet
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Transférez des fonds depuis votre carte vers votre portefeuille
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Sélectionner la Carte</Label>
                  <Select
                    value={selectedCardId?.toString() || ''}
                    onValueChange={(value) => setSelectedCardId(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Choisir une carte" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.filter(card => card.sold > 0).map((card) => (
                        <SelectItem key={card.id} value={card.id.toString()}>
                          {formatCardNumberMasked(card.cardNumber)} - {formatBalance(card.sold)} DT
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Montant à Transférer (DT)</Label>
                  <Input
                    type="number"
                    placeholder="0.000"
                    step="0.001"
                    min="0.001"
                    max="100000"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <Button 
                  onClick={() => {
                    const transferError = validateTransfer();
                    if (transferError) {
                      setError(transferError);
                    } else {
                      setShowAddToWallet(true);
                    }
                  }}
                  disabled={!selectedCardId || !transferAmount}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Transférer vers Wallet
                </Button>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  onClick={() => navigate('/dashboard/wallet')}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Retour au Portefeuille
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  onClick={fetchData}
                  disabled={processing}
                >
                  Actualiser la liste
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de confirmation de transfert */}
        <Dialog open={showAddToWallet} onOpenChange={setShowAddToWallet}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Confirmer le Transfert</DialogTitle>
              <DialogDescription className="text-slate-400">
                Êtes-vous sûr de vouloir transférer {transferAmount} DT depuis votre carte vers votre wallet ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowAddToWallet(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleTransferToWallet}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Transfert...
                  </>
                ) : (
                  'Confirmer le Transfert'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ViewCards;