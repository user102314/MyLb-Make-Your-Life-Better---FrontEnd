// src/pages/BestSales.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Trophy, 
  BarChart3, 
  DollarSign, 
  Users, 
  ArrowUpRight,
  RefreshCw,
  Calendar,
  Building2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API_TRANSACTIONS_URL = "http://localhost:9090/api/transactions";
const API_AUTH_CHECK_URL = "http://localhost:9090/api/client/name";

interface StockTransaction {
  id: number;
  nomStock: string;
  quantite: number;
  type: string;
  prix: number;
  dateCreation: string;
}

interface BestSalesData {
  stockTransactions: Array<[null, string, number, string, number, string]>;
  topStocks: string[];
  totalStockTransactions: number;
}

const BestSales: React.FC = () => {
  const navigate = useNavigate();
  const [bestSalesData, setBestSalesData] = useState<BestSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

      // Charger les données des meilleures ventes
      const data = await apiCall<BestSalesData>(`${API_TRANSACTIONS_URL}/admin/stock-transactions`);
      if (data) {
        setBestSalesData(data);
      } else {
        throw new Error('Erreur lors du chargement des données');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des données';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les données
  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Formater le prix
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculer les statistiques des stocks
  const calculateStockStats = () => {
    if (!bestSalesData) return null;

    const stockStats: { [key: string]: { totalVentes: number, totalQuantite: number, montantTotal: number } } = {};

    bestSalesData.stockTransactions.forEach(transaction => {
      const [_, nomStock, quantite, type, prix] = transaction;
      
      if (!stockStats[nomStock]) {
        stockStats[nomStock] = { totalVentes: 0, totalQuantite: 0, montantTotal: 0 };
      }

      if (type === 'Vente') {
        stockStats[nomStock].totalVentes += 1;
        stockStats[nomStock].totalQuantite += quantite;
        stockStats[nomStock].montantTotal += quantite * prix;
      }
    });

    return stockStats;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des meilleures ventes...</p>
        </div>
      </div>
    );
  }

  const stockStats = calculateStockStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Meilleures Ventes</h1>
          <p className="text-slate-300">Découvrez les actions les plus populaires du marché</p>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Bouton de rafraîchissement */}
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={refreshing}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {bestSalesData && (
          <div className="space-y-6">
            {/* Top 3 Stocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {bestSalesData.topStocks.map((stock, index) => (
                <Card key={stock} className={`border-0 text-white shadow-2xl ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-600 to-orange-600' :
                  index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                  'bg-gradient-to-br from-amber-700 to-amber-900'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge variant="secondary" className={`${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                          index === 1 ? 'bg-gray-500/20 text-gray-300' :
                          'bg-amber-500/20 text-amber-300'
                        } border-0 mb-2`}>
                          {index === 0 ? '🥇 1er' : index === 1 ? '🥈 2ème' : '🥉 3ème'}
                        </Badge>
                        <p className="text-white/80 text-sm">Meilleure vente</p>
                      </div>
                      <Trophy className="w-8 h-8 text-white/60" />
                    </div>

                    <div className="mb-4">
                      <p className="text-white/60 text-sm mb-1">Action</p>
                      <h3 className="text-2xl font-bold">{stock}</h3>
                    </div>

                    {stockStats && stockStats[stock] && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Ventes totales</span>
                          <span className="font-bold">{stockStats[stock].totalVentes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Quantité vendue</span>
                          <span className="font-bold">{stockStats[stock].totalQuantite}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/20 pt-2">
                          <span className="text-white/60 font-semibold">Chiffre d'affaires</span>
                          <span className="font-bold text-green-300">
                            {formatPrice(stockStats[stock].montantTotal)} €
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Statistiques Globales */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistiques Globales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {bestSalesData.totalStockTransactions}
                    </div>
                    <div className="text-slate-400 text-sm">Transactions stocks</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {bestSalesData.stockTransactions.filter(t => t[3] === 'Vente').length}
                    </div>
                    <div className="text-slate-400 text-sm">Ventes totales</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {bestSalesData.stockTransactions.filter(t => t[3] === 'Achat').length}
                    </div>
                    <div className="text-slate-400 text-sm">Achats totaux</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">
                      {new Set(bestSalesData.stockTransactions.map(t => t[1])).size}
                    </div>
                    <div className="text-slate-400 text-sm">Actions différentes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Détails des Transactions */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Toutes les transactions
                </TabsTrigger>
                <TabsTrigger value="sales" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Ventes seulement
                </TabsTrigger>
                <TabsTrigger value="purchases" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Achats seulement
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <TransactionList 
                  transactions={bestSalesData.stockTransactions} 
                  title="Toutes les Transactions de Stocks"
                />
              </TabsContent>

              <TabsContent value="sales">
                <TransactionList 
                  transactions={bestSalesData.stockTransactions.filter(t => t[3] === 'Vente')}
                  title="Transactions de Vente"
                />
              </TabsContent>

              <TabsContent value="purchases">
                <TransactionList 
                  transactions={bestSalesData.stockTransactions.filter(t => t[3] === 'Achat')}
                  title="Transactions d'Achat"
                />
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => navigate('/dashboard/stocklist')}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Voir le Marché
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => navigate('/dashboard/stock-wallet')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Mon Portefeuille
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour afficher la liste des transactions
interface TransactionListProps {
  transactions: Array<[null, string, number, string, number, string]>;
  title: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, title }) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-slate-400">
          {transactions.length} transaction(s) trouvée(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune transaction trouvée</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-full ${
                    transaction[3] === 'Vente' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {transaction[3] === 'Vente' ? <TrendingUp className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium">{transaction[1]}</p>
                      <Badge variant={transaction[3] === 'Vente' ? 'default' : 'secondary'}>
                        {transaction[3]}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {transaction[2]} action(s) à {formatPrice(transaction[4])} €
                    </p>
                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(transaction[5])}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction[3] === 'Vente' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {formatPrice(transaction[2] * transaction[4])} €
                  </p>
                  <p className="text-slate-400 text-sm">Total</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BestSales;