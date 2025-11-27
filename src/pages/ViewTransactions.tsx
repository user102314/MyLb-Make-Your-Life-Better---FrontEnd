// src/pages/ViewTransactions.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  Filter, 
  Download, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Calendar,
  CreditCard,
  User,
  BarChart3,
  RefreshCw,
  Eye,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API_TRANSACTIONS_URL = "http://localhost:9090/api/transactions";
const API_WALLET_URL = "http://localhost:9090/api/wallets";
const API_AUTH_CHECK_URL = "http://localhost:9090/api/client/name";

interface Transaction {
  id: number;
  idClient: number;
  typeOperation: string;
  montant: number;
  description: string;
  statut: string;
  idDestinataire?: number;
  emailDestinataire?: string;
  idCarte?: number;
  dateCreation: string;
  soldeApresOperation?: number;
}

interface TransactionStats {
  totalDeposits: number;
  totalWithdrawals: number;
  netFlow: number;
  transactionCount?: number;
  averageAmount?: number;
  hasTransactions?: boolean;
  lastTransactionDate?: string;
  lastTransactionType?: string;
  lastTransactionAmount?: number;
}

const ViewTransactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('DATE_DESC');

  // États pour les détails
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
    try {
      // Vérifier l'authentification
      const authResponse = await fetch(API_AUTH_CHECK_URL, { 
        credentials: 'include' 
      });
      
      if (authResponse.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      // Charger les transactions (NOUVEL ENDPOINT)
      const transactionsData = await apiCall<Transaction[]>(`${API_TRANSACTIONS_URL}`);
      if (transactionsData) {
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
      }

      // Charger les statistiques (NOUVEL ENDPOINT)
      const statsData = await apiCall<TransactionStats>(`${API_TRANSACTIONS_URL}/stats`);
      if (statsData) {
        setStats(statsData);
      }

      // Charger le solde du wallet (NOUVEL ENDPOINT)
      const walletData = await apiCall<{ solde: number }>(`${API_WALLET_URL}/solde`);
      if (walletData) {
        setWalletBalance(walletData.solde || 0);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...transactions];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.typeOperation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.emailDestinataire && transaction.emailDestinataire.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par type
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.typeOperation === typeFilter);
    }

    // Filtre par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.statut === statusFilter);
    }

    // Filtre par date
    if (dateFilter !== 'ALL') {
      const now = new Date();
      let startDate = new Date();

      switch (dateFilter) {
        case 'TODAY':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'WEEK':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'MONTH':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'YEAR':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.dateCreation);
        return transactionDate >= startDate;
      });
    }

    // Tri
    filtered.sort((a, b) => {
      const dateA = new Date(a.dateCreation);
      const dateB = new Date(b.dateCreation);

      switch (sortBy) {
        case 'DATE_ASC':
          return dateA.getTime() - dateB.getTime();
        case 'DATE_DESC':
          return dateB.getTime() - dateA.getTime();
        case 'AMOUNT_ASC':
          return a.montant - b.montant;
        case 'AMOUNT_DESC':
          return b.montant - a.montant;
        default:
          return dateB.getTime() - dateA.getTime();
      }
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, typeFilter, statusFilter, dateFilter, sortBy]);

  // Charger les transactions par type
  const loadTransactionsByType = async (type: string) => {
    try {
      const transactionsData = await apiCall<Transaction[]>(`${API_TRANSACTIONS_URL}/type/${type}`);
      if (transactionsData) {
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
        setTypeFilter(type);
      }
    } catch (err) {
      console.error('Error loading transactions by type:', err);
    }
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur du type de transaction
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'CARD_TO_WALLET':
        return 'text-green-400';
      case 'WITHDRAW':
      case 'WALLET_TO_CARD':
      case 'USER_TRANSFER':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  // Obtenir l'icône du type de transaction
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'CARD_TO_WALLET':
        return <ArrowDown className="w-4 h-4" />;
      case 'WITHDRAW':
      case 'WALLET_TO_CARD':
      case 'USER_TRANSFER':
        return <ArrowUp className="w-4 h-4" />;
      case 'CARD_CREATION':
      case 'CARD_DEACTIVATION':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Obtenir le libellé du type de transaction
  const getTransactionLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'DEPOSIT': 'Dépôt',
      'WITHDRAW': 'Retrait',
      'CARD_TO_WALLET': 'Carte → Wallet',
      'WALLET_TO_CARD': 'Wallet → Carte',
      'USER_TRANSFER': 'Transfert Utilisateur',
      'CARD_CREATION': 'Création Carte',
      'CARD_DEACTIVATION': 'Désactivation Carte'
    };
    return labels[type] || type;
  };

  // Exporter les transactions
  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Montant (DT)', 'Description', 'Statut', 'Solde Après'],
      ...filteredTransactions.map(t => [
        formatDate(t.dateCreation),
        getTransactionLabel(t.typeOperation),
        formatAmount(t.montant),
        t.description,
        t.statut,
        t.soldeApresOperation ? formatAmount(t.soldeApresOperation) : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Historique des Transactions</h1>
          <p className="text-slate-300">Suivez toutes vos opérations financières</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Statistiques et Filtres */}
          <div className="space-y-6">
            {/* Carte du Wallet */}
            <Card className="bg-gradient-to-br from-blue-600 to-purple-700 border-0 text-white shadow-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 mb-2">
                      Solde Actuel
                    </Badge>
                    <p className="text-blue-200 text-sm">MyLb Wallet</p>
                  </div>
                  <Wallet className="w-6 h-6 text-white/80" />
                </div>

                <div className="mb-4">
                  <p className="text-blue-200 text-sm mb-1">Solde Disponible</p>
                  <h2 className="text-3xl font-bold">
                    {formatAmount(walletBalance)} DT
                  </h2>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-blue-200">Transactions</p>
                    <p className="font-bold">{transactions.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200">Statut</p>
                    <p className="font-bold">Connecté</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Total Dépôts</span>
                      <span className="text-green-400 font-bold">+{formatAmount(stats.totalDeposits)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Total Retraits</span>
                      <span className="text-red-400 font-bold">-{formatAmount(stats.totalWithdrawals)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-700 pt-3">
                      <span className="text-slate-300 font-semibold">Flux Net</span>
                      <span className={`font-bold ${
                        stats.netFlow >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stats.netFlow >= 0 ? '+' : ''}{formatAmount(stats.netFlow)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-4">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Chargement des statistiques...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filtres Rapides par Type */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Types Rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => loadTransactionsByType('DEPOSIT')}
                >
                  <ArrowDown className="w-4 h-4 mr-2 text-green-400" />
                  Dépôts
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => loadTransactionsByType('WITHDRAW')}
                >
                  <ArrowUp className="w-4 h-4 mr-2 text-red-400" />
                  Retraits
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => loadTransactionsByType('USER_TRANSFER')}
                >
                  <User className="w-4 h-4 mr-2 text-blue-400" />
                  Transferts
                </Button>
              </CardContent>
            </Card>

            {/* Filtres */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recherche */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Recherche</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                {/* Type de transaction */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous les types</SelectItem>
                      <SelectItem value="DEPOSIT">Dépôts</SelectItem>
                      <SelectItem value="WITHDRAW">Retraits</SelectItem>
                      <SelectItem value="CARD_TO_WALLET">Carte → Wallet</SelectItem>
                      <SelectItem value="WALLET_TO_CARD">Wallet → Carte</SelectItem>
                      <SelectItem value="USER_TRANSFER">Transferts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Statut */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Statut</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous les statuts</SelectItem>
                      <SelectItem value="COMPLETED">Terminé</SelectItem>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="FAILED">Échoué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Période */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Période</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Toute période</SelectItem>
                      <SelectItem value="TODAY">Aujourd'hui</SelectItem>
                      <SelectItem value="WEEK">7 derniers jours</SelectItem>
                      <SelectItem value="MONTH">30 derniers jours</SelectItem>
                      <SelectItem value="YEAR">Cette année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tri */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Trier par</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DATE_DESC">Date (récent)</SelectItem>
                      <SelectItem value="DATE_ASC">Date (ancien)</SelectItem>
                      <SelectItem value="AMOUNT_DESC">Montant (↓)</SelectItem>
                      <SelectItem value="AMOUNT_ASC">Montant (↑)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('ALL');
                      setStatusFilter('ALL');
                      setDateFilter('ALL');
                      setSortBy('DATE_DESC');
                      fetchData(); // Recharger toutes les transactions
                    }}
                  >
                    Réinitialiser
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={fetchData}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
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
                  onClick={exportTransactions}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Transactions</CardTitle>
                    <CardDescription className="text-slate-400">
                      {filteredTransactions.length} transaction(s) trouvée(s)
                      {filteredTransactions.length !== transactions.length && 
                        ` (sur ${transactions.length} au total)`}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    Session Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <h3 className="text-xl font-semibold text-white mb-2">Aucune transaction</h3>
                    <p className="text-slate-400 mb-4">
                      {transactions.length === 0 
                        ? "Vous n'avez effectué aucune transaction pour le moment"
                        : "Aucune transaction ne correspond à vos filtres"
                      }
                    </p>
                    {transactions.length === 0 && (
                      <Button 
                        onClick={() => navigate('/dashboard/wallet')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Effectuer une transaction
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetails(true);
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-full ${
                            transaction.typeOperation.includes('DEPOSIT') || transaction.typeOperation.includes('CARD_TO_WALLET')
                              ? 'bg-green-500/20 text-green-400'
                              : transaction.typeOperation.includes('WITHDRAW') || transaction.typeOperation.includes('WALLET_TO_CARD')
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {getTransactionIcon(transaction.typeOperation)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-medium">
                                {getTransactionLabel(transaction.typeOperation)}
                              </p>
                              <Badge variant={
                                transaction.statut === 'COMPLETED' ? 'default' :
                                transaction.statut === 'PENDING' ? 'secondary' : 'destructive'
                              } className="text-xs">
                                {transaction.statut === 'COMPLETED' ? 'Terminé' :
                                 transaction.statut === 'PENDING' ? 'En attente' : 'Échoué'}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">{transaction.description}</p>
                            <p className="text-slate-500 text-xs mt-1">
                              {formatDate(transaction.dateCreation)}
                              {transaction.soldeApresOperation && (
                                <span className="ml-2">
                                  • Solde: {formatAmount(transaction.soldeApresOperation)} DT
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-lg font-bold ${getTransactionColor(transaction.typeOperation)}`}>
                            {transaction.typeOperation.includes('DEPOSIT') || transaction.typeOperation.includes('CARD_TO_WALLET') ? '+' : '-'}
                            {formatAmount(transaction.montant)} DT
                          </p>
                          <div className="flex items-center gap-2 mt-2 justify-end">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400 text-sm">Voir</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Résumé des types de transactions */}
            {transactions.length > 0 && (
              <Card className="bg-slate-800 border-slate-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-white">Répartition par Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(
                      transactions.reduce((acc, transaction) => {
                        const type = transaction.typeOperation;
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                      }, {} as { [key: string]: number })
                    ).map(([type, count]) => (
                      <div key={type} className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className={`text-2xl font-bold mb-1 ${getTransactionColor(type)}`}>
                          {count}
                        </div>
                        <p className="text-slate-300 text-sm">{getTransactionLabel(type)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialog des détails de transaction */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          {selectedTransaction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${
                    selectedTransaction.typeOperation.includes('DEPOSIT') || selectedTransaction.typeOperation.includes('CARD_TO_WALLET')
                      ? 'bg-green-500/20 text-green-400'
                      : selectedTransaction.typeOperation.includes('WITHDRAW') || selectedTransaction.typeOperation.includes('WALLET_TO_CARD')
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {getTransactionIcon(selectedTransaction.typeOperation)}
                  </div>
                  {getTransactionLabel(selectedTransaction.typeOperation)}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Détails de la transaction
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Montant */}
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm">Montant</p>
                  <p className={`text-3xl font-bold ${getTransactionColor(selectedTransaction.typeOperation)}`}>
                    {selectedTransaction.typeOperation.includes('DEPOSIT') || selectedTransaction.typeOperation.includes('CARD_TO_WALLET') ? '+' : '-'}
                    {formatAmount(selectedTransaction.montant)} DT
                  </p>
                </div>

                {/* Informations détaillées */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date</span>
                    <span className="text-white">{formatDate(selectedTransaction.dateCreation)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-400">Statut</span>
                    <Badge variant={
                      selectedTransaction.statut === 'COMPLETED' ? 'default' :
                      selectedTransaction.statut === 'PENDING' ? 'secondary' : 'destructive'
                    }>
                      {selectedTransaction.statut === 'COMPLETED' ? 'Terminé' :
                       selectedTransaction.statut === 'PENDING' ? 'En attente' : 'Échoué'}
                    </Badge>
                  </div>

                  {selectedTransaction.description && (
                    <div>
                      <span className="text-slate-400 block mb-1">Description</span>
                      <p className="text-white text-sm">{selectedTransaction.description}</p>
                    </div>
                  )}

                  {selectedTransaction.soldeApresOperation && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Solde après opération</span>
                      <span className="text-white font-semibold">
                        {formatAmount(selectedTransaction.soldeApresOperation)} DT
                      </span>
                    </div>
                  )}

                  {selectedTransaction.emailDestinataire && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Destinataire</span>
                      <span className="text-white">{selectedTransaction.emailDestinataire}</span>
                    </div>
                  )}

                  {selectedTransaction.idCarte && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Carte concernée</span>
                      <span className="text-white">ID: {selectedTransaction.idCarte}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewTransactions;