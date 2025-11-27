// src/pages/StockWallet.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Eye,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Building2,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// URLs des APIs
const STOCK_WALLET_API_URL = "http://localhost:9090/api/stock-wallet";
const STOCK_TRADE_API_URL = "http://localhost:9090/api/stock-trade";
const WALLET_API_URL = "http://localhost:9090/api/wallets";
const API_AUTH_CHECK_URL = "http://localhost:9090/api/client/name";

interface StockWalletItem {
  id: number;
  idClient: number;
  idStock: number;
  nomStock: string;
  prix: number;
  quantite: number;
  prixTotal: number;
  dateAchat: string;
}

interface StockCurrentPrice {
  id_stock: number;
  prix_stock: number;
  nom_stock: string;
}

interface StockWalletStats {
  totalStocks: number;
  distinctStocks: number;
  totalInvestment: number;
  totalQuantity: number;
}

const StockWallet: React.FC = () => {
  const navigate = useNavigate();
  const [stockWallet, setStockWallet] = useState<StockWalletItem[]>([]);
  const [currentPrices, setCurrentPrices] = useState<{ [key: number]: number }>({});
  const [walletStats, setWalletStats] = useState<StockWalletStats | null>(null);
  const [clientSolde, setClientSolde] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [tradingLoading, setTradingLoading] = useState<number | null>(null);
  const [tradeMessage, setTradeMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [sellQuantities, setSellQuantities] = useState<{ [key: number]: number }>({});

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

  // Vérification de l'authentification et chargement des données
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

      // Récupérer le stock wallet (NOUVEL ENDPOINT)
      const walletData = await apiCall<StockWalletItem[]>(`${STOCK_WALLET_API_URL}`);
      if (walletData) {
        setStockWallet(walletData);
        
        // Récupérer les prix actuels pour chaque stock
        await fetchCurrentPrices(walletData);
      }

      // Récupérer les statistiques du wallet (NOUVEL ENDPOINT)
      const statsData = await apiCall<StockWalletStats>(`${STOCK_WALLET_API_URL}/stats`);
      if (statsData) {
        setWalletStats(statsData);
      }

      // Récupérer le solde du wallet (NOUVEL ENDPOINT)
      const soldeData = await apiCall<{ solde: number }>(`${WALLET_API_URL}/solde`);
      if (soldeData) {
        setClientSolde(soldeData.solde || 0);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les prix actuels des stocks
  const fetchCurrentPrices = async (walletData: StockWalletItem[]) => {
    try {
      // Récupérer tous les stocks depuis Spring Boot pour avoir les prix actuels
      const stocksResponse = await fetch("http://localhost:9090/api/stocks", {
        credentials: 'include'
      });
      
      if (stocksResponse.ok) {
        const stocksData = await stocksResponse.json();
        const prices: { [key: number]: number } = {};
        
        stocksData.forEach((stock: any) => {
          prices[stock.idStock] = stock.prixStock;
        });
        
        setCurrentPrices(prices);
      }
    } catch (err) {
      console.error('Error fetching current prices:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Vendre des stocks
  const handleSellStock = async (stockWalletId: number, stockId: number, maxQuantity: number) => {
    const quantity = sellQuantities[stockWalletId] || 1;
    if (quantity <= 0 || quantity > maxQuantity) {
      setTradeMessage({ type: 'error', message: 'Quantité invalide' });
      return;
    }

    setTradingLoading(stockWalletId);
    setTradeMessage(null);

    try {
      const sellRequest = {
        idStockWallet: stockWalletId,
        quantite: quantity
      };

      const response = await fetch(`${STOCK_TRADE_API_URL}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(sellRequest)
      });

      const result = await response.json();

      if (result.success) {
        setTradeMessage({ type: 'success', message: result.message });
        setClientSolde(result.nouveauSolde);
        // Recharger les données
        await fetchData();
      } else {
        setTradeMessage({ type: 'error', message: result.message });
      }
    } catch (err) {
      setTradeMessage({ type: 'error', message: 'Erreur lors de la vente' });
      console.error('Error selling stock:', err);
    } finally {
      setTradingLoading(null);
      setSellQuantities(prev => ({ ...prev, [stockWalletId]: 1 }));
    }
  };

  // Vendre tout
  const handleSellAll = async (stockWalletId: number, stockId: number, quantity: number) => {
    setSellQuantities(prev => ({ ...prev, [stockWalletId]: quantity }));
    await handleSellStock(stockWalletId, stockId, quantity);
  };

  // Supprimer un stock du wallet (NOUVEL ENDPOINT)
  const handleDeleteStock = async (stockId: number) => {
    try {
      const response = await fetch(`${STOCK_WALLET_API_URL}/${stockId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setTradeMessage({ type: 'success', message: 'Stock supprimé du portefeuille' });
        await fetchData();
      } else {
        setTradeMessage({ type: 'error', message: 'Erreur lors de la suppression' });
      }
    } catch (err) {
      setTradeMessage({ type: 'error', message: 'Erreur lors de la suppression' });
      console.error('Error deleting stock:', err);
    }
  };

  // Calculer le profit/pertes
  const calculateProfit = (purchasePrice: number, currentPrice: number, quantity: number) => {
    const totalPurchase = purchasePrice * quantity;
    const totalCurrent = currentPrice * quantity;
    const profit = totalCurrent - totalPurchase;
    const profitPercentage = ((profit / totalPurchase) * 100);
    
    return {
      profit,
      profitPercentage,
      isProfit: profit >= 0
    };
  };

  // Formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de votre portefeuille...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mon Portefeuille d'Actions</h1>
          <p className="text-slate-300">Gérez vos investissements en bourse</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Statistiques */}
          <div className="space-y-6">
            {/* Carte du Solde */}
            <Card className="bg-gradient-to-br from-blue-600 to-purple-700 border-0 text-white shadow-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 mb-2">
                      Solde Actuel
                    </Badge>
                    <p className="text-blue-200 text-sm">Portefeuille Principal</p>
                  </div>
                  <Wallet className="w-6 h-6 text-white/80" />
                </div>

                <div className="mb-4">
                  <p className="text-blue-200 text-sm mb-1">Solde Disponible</p>
                  <h2 className="text-3xl font-bold">
                    {formatPrice(clientSolde)} €
                  </h2>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-blue-200">Actions</p>
                    <p className="font-bold">{stockWallet.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200">Statut</p>
                    <p className="font-bold">Connecté</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques du Wallet */}
            {walletStats ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Total Investi</span>
                    <span className="text-white font-bold">{formatPrice(walletStats.totalInvestment)} €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Actions différentes</span>
                    <span className="text-green-400 font-bold">{walletStats.distinctStocks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Quantité totale</span>
                    <span className="text-blue-400 font-bold">{walletStats.totalQuantity}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-700 pt-3">
                    <span className="text-slate-300 font-semibold">Valeur estimée</span>
                    <span className="text-yellow-400 font-bold">
                      {formatPrice(
                        stockWallet.reduce((total, stock) => {
                          const currentPrice = currentPrices[stock.idStock] || stock.prix;
                          return total + (currentPrice * stock.quantite);
                        }, 0)
                      )} €
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="text-center py-8">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                  <p className="text-slate-400">Chargement des statistiques...</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 space-y-4">
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
                  onClick={() => navigate('/dashboard/stocklist')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir le Marché
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {stockWallet.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="text-center py-12">
                  <Wallet className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold text-white mb-2">Portefeuille vide</h3>
                  <p className="text-slate-400 mb-4">
                    Vous ne possédez aucune action pour le moment
                  </p>
                  <Button 
                    onClick={() => navigate('/dashboard/stocklist')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Découvrir le marché
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Message de trading */}
                {tradeMessage && (
                  <div className={`p-4 rounded-lg ${
                    tradeMessage.type === 'success' 
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                      : 'bg-red-500/20 border border-red-500/50 text-red-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      {tradeMessage.type === 'success' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      {tradeMessage.message}
                    </div>
                  </div>
                )}

                {/* Grille des stocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {stockWallet.map((stock) => {
                    const currentPrice = currentPrices[stock.idStock] || stock.prix;
                    const profitData = calculateProfit(stock.prix, currentPrice, stock.quantite);
                    const totalValue = currentPrice * stock.quantite;

                    return (
                      <Card key={stock.id} className="bg-slate-800 border-slate-700 hover:border-slate-500 transition-all duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-white text-lg">
                                {stock.nomStock}
                              </CardTitle>
                              <CardDescription className="text-slate-400 flex items-center gap-2 mt-1">
                                <Building2 className="w-3 h-3" />
                                Stock #{stock.idStock}
                              </CardDescription>
                            </div>
                            <Badge variant={profitData.isProfit ? "default" : "destructive"}>
                              {profitData.isProfit ? '📈' : '📉'} 
                              {profitData.isProfit ? '+' : ''}{profitData.profitPercentage.toFixed(2)}%
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Prix et Performance */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                              <div className="text-slate-400 text-xs">Prix d'achat</div>
                              <div className="text-white font-bold">{formatPrice(stock.prix)} €</div>
                            </div>
                            <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                              <div className="text-slate-400 text-xs">Prix actuel</div>
                              <div className={`font-bold ${
                                currentPrice >= stock.prix ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {formatPrice(currentPrice)} €
                              </div>
                            </div>
                          </div>

                          {/* Quantité et Valeur */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                              <div className="text-slate-400 text-xs">Quantité</div>
                              <div className="text-white font-bold">{stock.quantite}</div>
                            </div>
                            <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                              <div className="text-slate-400 text-xs">Valeur actuelle</div>
                              <div className="text-yellow-400 font-bold">{formatPrice(totalValue)} €</div>
                            </div>
                          </div>

                          {/* Profit/Pertes */}
                          <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                            <div className="text-slate-400 text-xs">Profit/Pertes</div>
                            <div className={`font-bold ${
                              profitData.isProfit ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {profitData.isProfit ? '+' : ''}{formatPrice(profitData.profit)} €
                            </div>
                          </div>

                          {/* Date d'achat */}
                          <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Acheté le {formatDate(stock.dateAchat)}
                          </div>
                        </CardContent>

                        <CardFooter className="flex gap-2 pt-0">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                              >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Vendre
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Vendre {stock.nomStock}</DialogTitle>
                                <DialogDescription>
                                  Vendez vos actions au prix actuel du marché
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Prix actuel</Label>
                                    <div className="text-2xl font-bold text-green-600">
                                      {formatPrice(currentPrice)} €
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Actions possédées</Label>
                                    <div className="text-lg font-semibold">
                                      {stock.quantite} action(s)
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor={`quantity-${stock.id}`}>Quantité à vendre</Label>
                                  <Input
                                    id={`quantity-${stock.id}`}
                                    type="number"
                                    min="1"
                                    max={stock.quantite}
                                    value={sellQuantities[stock.id] || 1}
                                    onChange={(e) => setSellQuantities(prev => ({
                                      ...prev,
                                      [stock.id]: parseInt(e.target.value) || 1
                                    }))}
                                    className="mt-1"
                                  />
                                </div>

                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                                  <div className="flex justify-between">
                                    <span>Montant de vente:</span>
                                    <span className="font-bold text-green-500">
                                      {formatPrice(currentPrice * (sellQuantities[stock.id] || 1))} €
                                    </span>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => handleSellStock(stock.id, stock.idStock, stock.quantite)}
                                    disabled={tradingLoading === stock.id}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                  >
                                    {tradingLoading === stock.id ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <DollarSign className="w-4 h-4 mr-2" />
                                    )}
                                    {tradingLoading === stock.id ? 'Vente...' : `Vendre ${sellQuantities[stock.id] || 1} action(s)`}
                                  </Button>
                                  
                                  <Button 
                                    onClick={() => handleSellAll(stock.id, stock.idStock, stock.quantite)}
                                    disabled={tradingLoading === stock.id}
                                    variant="outline"
                                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                  >
                                    Vendre tout
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button 
                            variant="outline" 
                            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            onClick={() => handleDeleteStock(stock.id)}
                          >
                            Supprimer
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>

                {/* Résumé de performance */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Performance du Portefeuille</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-500">
                          {stockWallet.filter(stock => {
                            const currentPrice = currentPrices[stock.idStock] || stock.prix;
                            return currentPrice >= stock.prix;
                          }).length}
                        </div>
                        <div className="text-slate-400 text-sm">Stocks en profit</div>
                      </div>
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-red-500">
                          {stockWallet.filter(stock => {
                            const currentPrice = currentPrices[stock.idStock] || stock.prix;
                            return currentPrice < stock.prix;
                          }).length}
                        </div>
                        <div className="text-slate-400 text-sm">Stocks en perte</div>
                      </div>
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-500">
                          {formatPrice(
                            stockWallet.reduce((total, stock) => {
                              const currentPrice = currentPrices[stock.idStock] || stock.prix;
                              return total + (currentPrice * stock.quantite);
                            }, 0)
                          )}
                        </div>
                        <div className="text-slate-400 text-sm">Valeur totale</div>
                      </div>
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-500">
                          {formatPrice(
                            stockWallet.reduce((total, stock) => {
                              const currentPrice = currentPrices[stock.idStock] || stock.prix;
                              return total + ((currentPrice - stock.prix) * stock.quantite);
                            }, 0)
                          )}
                        </div>
                        <div className="text-slate-400 text-sm">Profit total</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockWallet;