// src/pages/StatisticsPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  ArrowUp,
  ArrowDown,
  PieChart,
  Activity,
  RefreshCw,
  Home,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
}

interface MonthlyData {
  month: string;
  deposits: number;
  withdrawals: number;
  net: number;
  transactionCount: number;
}

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<number | null>(null);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

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
    try {
      // Charger les transactions
      const transactionsResponse = await fetch(`${API_TRANSACTIONS_URL}`, {
        credentials: 'include'
      });
      
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
        processMonthlyData(transactionsData);
      }

      // Charger les statistiques
      const statsResponse = await fetch(`${API_TRANSACTIONS_URL}/stats`, {
        credentials: 'include'
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Charger le solde du wallet
      const walletResponse = await fetch(`${API_WALLET_URL}/solde`, {
        credentials: 'include'
      });
      
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWalletBalance(walletData.solde || 0);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  // Traiter les données mensuelles
  const processMonthlyData = (transactions: Transaction[]) => {
    const monthlyMap = new Map<string, MonthlyData>();
    
    transactions.forEach(transaction => {
      if (transaction.statut !== 'COMPLETED') return;
      
      const date = new Date(transaction.dateCreation);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthLabel,
          deposits: 0,
          withdrawals: 0,
          net: 0,
          transactionCount: 0
        });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      
      if (transaction.typeOperation.includes('DEPOSIT') || transaction.typeOperation.includes('CARD_TO_WALLET')) {
        monthData.deposits += transaction.montant;
        monthData.net += transaction.montant;
      } else if (transaction.typeOperation.includes('WITHDRAW') || transaction.typeOperation.includes('WALLET_TO_CARD') || transaction.typeOperation.includes('USER_TRANSFER')) {
        monthData.withdrawals += transaction.montant;
        monthData.net -= transaction.montant;
      }
      
      monthData.transactionCount += 1;
    });
    
    // Convertir en tableau et trier par date
    const monthlyArray = Array.from(monthlyMap.values()).sort((a, b) => {
      return new Date(b.month).getTime() - new Date(a.month).getTime();
    });
    
    setMonthlyData(monthlyArray);
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  // Obtenir les transactions filtrées selon la période
  const getFilteredTransactions = () => {
    if (periodFilter === 'ALL') return transactions;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (periodFilter) {
      case 'MONTH':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'QUARTER':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'YEAR':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter(transaction => 
      new Date(transaction.dateCreation) >= startDate
    );
  };

  // Calculer les statistiques avancées
  const calculateAdvancedStats = () => {
    const filteredTransactions = getFilteredTransactions();
    const completedTransactions = filteredTransactions.filter(t => t.statut === 'COMPLETED');
    
    const deposits = completedTransactions.filter(t => 
      t.typeOperation.includes('DEPOSIT') || t.typeOperation.includes('CARD_TO_WALLET')
    );
    
    const withdrawals = completedTransactions.filter(t => 
      t.typeOperation.includes('WITHDRAW') || t.typeOperation.includes('WALLET_TO_CARD') || t.typeOperation.includes('USER_TRANSFER')
    );
    
    const totalDeposits = deposits.reduce((sum, t) => sum + t.montant, 0);
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.montant, 0);
    const netFlow = totalDeposits - totalWithdrawals;
    
    const avgDeposit = deposits.length > 0 ? totalDeposits / deposits.length : 0;
    const avgWithdrawal = withdrawals.length > 0 ? totalWithdrawals / withdrawals.length : 0;
    
    const successRate = filteredTransactions.length > 0 
      ? (completedTransactions.length / filteredTransactions.length) * 100 
      : 0;
    
    const mostFrequentType = Object.entries(
      completedTransactions.reduce((acc, t) => {
        acc[t.typeOperation] = (acc[t.typeOperation] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number })
    ).sort(([,a], [,b]) => b - a)[0];
    
    return {
      totalTransactions: filteredTransactions.length,
      completedTransactions: completedTransactions.length,
      successRate,
      totalDeposits,
      totalWithdrawals,
      netFlow,
      avgDeposit,
      avgWithdrawal,
      depositCount: deposits.length,
      withdrawalCount: withdrawals.length,
      mostFrequentType: mostFrequentType ? mostFrequentType[0] : 'Aucune',
      mostFrequentCount: mostFrequentType ? mostFrequentType[1] : 0
    };
  };

  // Générer le rapport CSV
  const generateReport = () => {
    const advancedStats = calculateAdvancedStats();
    const csvContent = [
      ['RAPPORT DE STATISTIQUES - MYLB WALLET'],
      [`Client ID: ${clientId}`, `Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`],
      [''],
      ['SOLDE ET SYNTHÈSE'],
      [`Solde actuel,${formatAmount(walletBalance)} DT`],
      [`Flux net total,${formatAmount(advancedStats.netFlow)} DT`],
      [''],
      ['STATISTIQUES GÉNÉRALES'],
      [`Total des transactions,${advancedStats.totalTransactions}`],
      [`Taux de réussite,${advancedStats.successRate.toFixed(1)}%`],
      [`Type le plus fréquent,${advancedStats.mostFrequentType} (${advancedStats.mostFrequentCount}x)`],
      [''],
      ['DÉPÔTS ET RETRAITS'],
      [`Total des dépôts,${formatAmount(advancedStats.totalDeposits)} DT`],
      [`Total des retraits,${formatAmount(advancedStats.totalWithdrawals)} DT`],
      [`Nombre de dépôts,${advancedStats.depositCount}`],
      [`Nombre de retraits,${advancedStats.withdrawalCount}`],
      [`Dépôt moyen,${formatAmount(advancedStats.avgDeposit)} DT`],
      [`Retrait moyen,${formatAmount(advancedStats.avgWithdrawal)} DT`],
      [''],
      ['DONNÉES MENSUELLES'],
      ['Mois,Dépôts (DT),Retraits (DT),Flux Net (DT),Nombre de transactions'],
      ...monthlyData.map(m => [
        m.month,
        formatAmount(m.deposits),
        formatAmount(m.withdrawals),
        formatAmount(m.net),
        m.transactionCount
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rapport-statistiques-${clientId}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Composant de graphique simple pour l'évolution du solde
  const BalanceChart = () => {
    const balanceHistory = transactions
      .filter(t => t.soldeApresOperation !== undefined && t.statut === 'COMPLETED')
      .sort((a, b) => new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime())
      .slice(-20); // Dernières 20 transactions pour la lisibilité

    if (balanceHistory.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-slate-500">
          Aucune donnée disponible pour l'évolution du solde
        </div>
      );
    }

    const maxBalance = Math.max(...balanceHistory.map(t => t.soldeApresOperation || 0));
    const minBalance = Math.min(...balanceHistory.map(t => t.soldeApresOperation || 0));

    return (
      <div className="h-48 relative">
        <div className="absolute inset-0 flex items-center justify-between">
          {balanceHistory.map((transaction, index) => {
            const balance = transaction.soldeApresOperation || 0;
            const percentage = ((balance - minBalance) / (maxBalance - minBalance || 1)) * 90;
            return (
              <div
                key={transaction.id}
                className="flex flex-col items-center"
                style={{ width: `${95 / balanceHistory.length}%` }}
              >
                <div
                  className="w-2 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-sm transition-all duration-300 hover:from-blue-400 hover:to-purple-500 cursor-pointer"
                  style={{ height: `${percentage}%` }}
                  title={`${formatAmount(balance)} DT - ${new Date(transaction.dateCreation).toLocaleDateString()}`}
                />
                {index % 3 === 0 && (
                  <span className="text-xs text-slate-400 mt-1">
                    {new Date(transaction.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Composant de graphique circulaire pour les types de transactions
  const TypeDistributionChart = () => {
    const typeCounts = transactions.reduce((acc, transaction) => {
      if (transaction.statut !== 'COMPLETED') return acc;
      
      const type = transaction.typeOperation;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-slate-500">
          Aucune transaction complétée
        </div>
      );
    }

    const colors = ['#10B981', '#EF4444', '#3B82F6', '#8B5CF6', '#F59E0B', '#6366F1'];
    let currentAngle = 0;

    return (
      <div className="h-48 relative">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {Object.entries(typeCounts).map(([type, count], index) => {
            const percentage = (count / total) * 100;
            const angle = (percentage / 100) * 360;
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const x1 = 50 + 40 * Math.cos(currentAngle * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin(currentAngle * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((currentAngle + angle) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((currentAngle + angle) * Math.PI / 180);
            
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');
            
            const segment = (
              <path
                key={type}
                d={pathData}
                fill={colors[index % colors.length]}
                opacity="0.8"
              />
            );
            
            currentAngle += angle;
            return segment;
          })}
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white font-bold text-lg">{total}</div>
            <div className="text-slate-400 text-xs">Transactions</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  const advancedStats = calculateAdvancedStats();
  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Rapport Statistiques</h1>
          <p className="text-slate-300">Analyse complète de votre activité financière</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
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
                    <p className="text-blue-200">Client ID</p>
                    <p className="font-mono">{clientId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200">Période</p>
                    <p className="font-bold">
                      {periodFilter === 'ALL' ? 'Toute période' :
                       periodFilter === 'MONTH' ? '30 jours' :
                       periodFilter === 'QUARTER' ? '3 mois' : '1 an'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filtres */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Période d'analyse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Sélectionner la période</Label>
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Toute période</SelectItem>
                      <SelectItem value="MONTH">30 derniers jours</SelectItem>
                      <SelectItem value="QUARTER">3 derniers mois</SelectItem>
                      <SelectItem value="YEAR">Cette année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={fetchData}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={generateReport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter Rapport
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => navigate('/dashboard/transactions')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Voir Transactions
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => navigate('/dashboard/wallet')}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Retour Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Indicateurs clés */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Indicateurs Clés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Taux de réussite</span>
                  <Badge variant={advancedStats.successRate >= 90 ? "default" : "secondary"}>
                    {advancedStats.successRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Transactions/jour</span>
                  <span className="text-white font-semibold">
                    {(advancedStats.totalTransactions / 30).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Type dominant</span>
                  <span className="text-white font-semibold text-xs text-right">
                    {advancedStats.mostFrequentType.split('_').join(' ')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:bg-slate-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Aperçu
                </TabsTrigger>
                <TabsTrigger value="evolution" className="text-slate-300 data-[state=active]:bg-slate-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Évolution
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-slate-300 data-[state=active]:bg-slate-700">
                  <Activity className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Total Transactions</p>
                          <p className="text-2xl font-bold text-white">{advancedStats.totalTransactions}</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-full">
                          <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-0">
                          {advancedStats.completedTransactions} réussies
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Total Dépôts</p>
                          <p className="text-2xl font-bold text-green-400">+{formatAmount(advancedStats.totalDeposits)}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-full">
                          <ArrowDown className="w-6 h-6 text-green-400" />
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mt-2">
                        {advancedStats.depositCount} opérations • Moyenne: {formatAmount(advancedStats.avgDeposit)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Total Retraits</p>
                          <p className="text-2xl font-bold text-red-400">-{formatAmount(advancedStats.totalWithdrawals)}</p>
                        </div>
                        <div className="p-3 bg-red-500/20 rounded-full">
                          <ArrowUp className="w-6 h-6 text-red-400" />
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mt-2">
                        {advancedStats.withdrawalCount} opérations • Moyenne: {formatAmount(advancedStats.avgWithdrawal)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Flux Net</p>
                          <p className={`text-2xl font-bold ${
                            advancedStats.netFlow >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {advancedStats.netFlow >= 0 ? '+' : ''}{formatAmount(advancedStats.netFlow)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${
                          advancedStats.netFlow >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {advancedStats.netFlow >= 0 ? 
                            <TrendingUp className="w-6 h-6 text-green-400" /> :
                            <TrendingDown className="w-6 h-6 text-red-400" />
                          }
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mt-2">
                        Solde initial: {formatAmount(walletBalance - advancedStats.netFlow)} DT
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Évolution du Solde
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Historique des soldes après chaque transaction
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BalanceChart />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        Répartition par Type
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Distribution des types de transactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TypeDistributionChart />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Evolution Tab */}
              <TabsContent value="evolution" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Évolution Mensuelle</CardTitle>
                    <CardDescription className="text-slate-400">
                      Analyse des flux financiers par mois
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyData.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          Aucune donnée mensuelle disponible
                        </div>
                      ) : (
                        monthlyData.map((month, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{month.month}</h4>
                              <p className="text-slate-400 text-sm">
                                {month.transactionCount} transaction(s)
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="flex items-center gap-4">
                                <span className="text-green-400 text-sm">+{formatAmount(month.deposits)}</span>
                                <span className="text-red-400 text-sm">-{formatAmount(month.withdrawals)}</span>
                                <span className={`font-bold ${
                                  month.net >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {month.net >= 0 ? '+' : ''}{formatAmount(month.net)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Performance des Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Taux de réussite</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${advancedStats.successRate}%` }}
                            />
                          </div>
                          <span className="text-white font-semibold">{advancedStats.successRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Transactions moyennes par jour</span>
                        <span className="text-white font-semibold">
                          {(advancedStats.totalTransactions / 30).toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Type le plus fréquent</span>
                        <span className="text-white font-semibold text-sm text-right">
                          {advancedStats.mostFrequentType.split('_').join(' ')}
                          <br />
                          <span className="text-slate-400">({advancedStats.mostFrequentCount} fois)</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Analyse des Montants</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Dépôt moyen</span>
                        <span className="text-green-400 font-semibold">
                          {formatAmount(advancedStats.avgDeposit)} DT
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Retrait moyen</span>
                        <span className="text-red-400 font-semibold">
                          {formatAmount(advancedStats.avgWithdrawal)} DT
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Ratio Dépôts/Retraits</span>
                        <span className="text-white font-semibold">
                          {(advancedStats.totalDeposits / (advancedStats.totalWithdrawals || 1)).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Résumé détaillé */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Résumé Analytique</CardTitle>
                    <CardDescription className="text-slate-400">
                      Synthèse de votre activité financière
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-slate-300">
                      <p>
                        Sur la période sélectionnée, vous avez effectué <strong>{advancedStats.totalTransactions} transactions</strong> 
                        avec un taux de réussite de <strong>{advancedStats.successRate.toFixed(1)}%</strong>.
                      </p>
                      
                      <p>
                        Votre activité montre un flux net <strong className={advancedStats.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {advancedStats.netFlow >= 0 ? 'positif' : 'négatif'}
                        </strong> de <strong>{formatAmount(Math.abs(advancedStats.netFlow))} DT</strong>.
                      </p>
                      
                      <p>
                        Le type d'opération le plus fréquent est <strong>{advancedStats.mostFrequentType.split('_').join(' ').toLowerCase()}</strong> 
                        avec <strong>{advancedStats.mostFrequentCount} occurrences</strong>.
                      </p>
                      
                      {advancedStats.netFlow > 0 && (
                        <p className="text-green-400">
                          ✅ Votre compte présente une croissance positive avec plus de dépôts que de retraits.
                        </p>
                      )}
                      
                      {advancedStats.netFlow < 0 && (
                        <p className="text-yellow-400">
                          ⚠️ Votre compte présente un flux négatif. Surveillez vos dépenses.
                        </p>
                      )}
                    </div>
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

export default StatisticsPage;