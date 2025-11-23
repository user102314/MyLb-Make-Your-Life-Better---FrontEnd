// src/pages/StockDetails.tsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Loader2, 
  RefreshCw, 
  ShoppingCart, 
  DollarSign,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';

interface HistoryItem {
  id: number;
  id_stock: number;
  prix: number;
  date_creation: string;
}

interface PriceChange {
  id: number;
  previousPrice: number;
  currentPrice: number;
  change: number;
  date: string;
  isIncrease: boolean;
}

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

// URLs des APIs
const PYTHON_API_BASE_URL = "http://localhost:8000";
const STOCK_TRADE_API_URL = "http://localhost:9090/api/stock-trade";
const STOCK_WALLET_API_URL = "http://localhost:9090/api/stock-wallet";
const WALLET_API_URL = "http://localhost:9090/api/wallets";
const API_AUTH_CHECK_URL = "http://localhost:9090/api/client/name";

const StockDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { stockId, stockName } = location.state || {};
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);
  const [increases, setIncreases] = useState<PriceChange[]>([]);
  const [decreases, setDecreases] = useState<PriceChange[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [timeFilter, setTimeFilter] = useState<string>('1h');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  // États pour les opérations de trading
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientSolde, setClientSolde] = useState<number>(0);
  const [clientStocks, setClientStocks] = useState<StockWalletItem[]>([]);
  const [tradingLoading, setTradingLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Vérification de l'authentification
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
          fetchClientData(parseInt(storedClientId));
        }
      } catch (err) {
        console.error('Authentication error:', err);
      }
    };

    checkAuthentication();
  }, [navigate]);

  // Charger les données du client
  const fetchClientData = async (idClient: number) => {
    try {
      // Récupérer le solde du wallet
      const soldeResponse = await fetch(`${WALLET_API_URL}/${idClient}/solde`, {
        credentials: 'include'
      });
      if (soldeResponse.ok) {
        const soldeData = await soldeResponse.json();
        setClientSolde(soldeData.solde || 0);
      }

      // Récupérer les stocks du client
      const stocksResponse = await fetch(`${STOCK_WALLET_API_URL}/client/${idClient}`, {
        credentials: 'include'
      });
      if (stocksResponse.ok) {
        const stocksData = await stocksResponse.json();
        setClientStocks(stocksData);
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
    }
  };

  // Fonction pour récupérer l'historique depuis l'API Python
  const fetchStockHistory = async (stockId: number, limit: number = 500) => {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/stock-history/${stockId}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.history;
    } catch (err) {
      console.error('Error fetching stock history:', err);
      throw err;
    }
  };

  // Charger les données initiales
  useEffect(() => {
    if (stockId) {
      loadInitialData();
    }
  }, [stockId]);

  // Auto-refresh chaque seconde (seulement pour le dernier point)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && stockId && history.length > 0) {
      interval = setInterval(() => {
        updateLastPrice();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, stockId, history]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const historyData = await fetchStockHistory(stockId);
      setHistory(historyData);
      processHistoryData(historyData);
      setLastUpdateTime(new Date());
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLastPrice = async () => {
    try {
      // Récupérer seulement les dernières données
      const recentData = await fetchStockHistory(stockId, 2);
      if (recentData && recentData.length > 0) {
        const newPrice = recentData[recentData.length - 1].prix;
        const previousPrice = lastPrice;
        const change = ((newPrice - previousPrice) / previousPrice) * 100;

        setLastPrice(newPrice);
        setPriceChange(change);
        setLastUpdateTime(new Date());

        // Mettre à jour seulement le dernier point du graphique
        updateChartWithNewPrice(newPrice);
      }
    } catch (err) {
      console.error('Error updating price:', err);
    }
  };

  // Opération d'achat
  const handleBuyStock = async () => {
    if (!clientId || buyQuantity <= 0) return;

    setTradingLoading(true);
    setTradeMessage(null);

    try {
      const buyRequest = {
        idClient: clientId,
        idStock: stockId,
        quantite: buyQuantity
      };

      const response = await fetch(`${STOCK_TRADE_API_URL}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(buyRequest)
      });

      const result = await response.json();

      if (result.success) {
        setTradeMessage({ type: 'success', message: result.message });
        setClientSolde(result.nouveauSolde);
        setBuyQuantity(1);
        // Recharger les données du client
        fetchClientData(clientId);
      } else {
        setTradeMessage({ type: 'error', message: result.message });
      }
    } catch (err) {
      setTradeMessage({ type: 'error', message: 'Erreur lors de l\'achat' });
      console.error('Error buying stock:', err);
    } finally {
      setTradingLoading(false);
    }
  };

  // Opération de vente
  const handleSellStock = async () => {
    if (!clientId || sellQuantity <= 0) return;

    setTradingLoading(true);
    setTradeMessage(null);

    try {
      // Trouver le stock dans le wallet du client
      const clientStock = clientStocks.find(stock => stock.idStock === stockId);
      if (!clientStock) {
        setTradeMessage({ type: 'error', message: 'Vous ne possédez pas ce stock' });
        return;
      }

      const sellRequest = {
        idClient: clientId,
        idStockWallet: clientStock.id,
        quantite: sellQuantity
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
        setSellQuantity(1);
        // Recharger les données du client
        fetchClientData(clientId);
      } else {
        setTradeMessage({ type: 'error', message: result.message });
      }
    } catch (err) {
      setTradeMessage({ type: 'error', message: 'Erreur lors de la vente' });
      console.error('Error selling stock:', err);
    } finally {
      setTradingLoading(false);
    }
  };

  const updateChartWithNewPrice = (newPrice: number) => {
    if (chartData.length === 0) return;

    setChartData(prevData => {
      const newData = [...prevData];
      
      // Garder tous les points sauf le dernier
      const baseData = newData.slice(0, -1);
      
      // Ajouter le nouveau point avec le timestamp actuel
      const now = new Date();
      const newPoint = {
        timestamp: now.getTime(),
        time: formatTime(now, timeFilter),
        price: newPrice,
        date: now.toLocaleDateString('fr-FR'),
        isNew: true
      };
      
      return [...baseData, newPoint];
    });
  };

  const processHistoryData = (historyData: HistoryItem[]) => {
    if (!historyData || historyData.length === 0) return;

    const sortedHistory = [...historyData].sort((a, b) => 
      new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime()
    );

    const currentPrice = sortedHistory[sortedHistory.length - 1].prix;
    const previousPrice = sortedHistory.length > 1 ? sortedHistory[sortedHistory.length - 2].prix : currentPrice;
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;

    setLastPrice(currentPrice);
    setPriceChange(change);

    const filteredData = filterDataByTime(sortedHistory, timeFilter);

    const newChartData = filteredData.map((item, index) => ({
      timestamp: new Date(item.date_creation).getTime(),
      time: formatTime(new Date(item.date_creation), timeFilter),
      price: item.prix,
      date: new Date(item.date_creation).toLocaleDateString('fr-FR'),
      isNew: index === filteredData.length - 1
    }));
    setChartData(newChartData);

    const changes: PriceChange[] = [];
    const increasesList: PriceChange[] = [];
    const decreasesList: PriceChange[] = [];

    for (let i = 1; i < filteredData.length; i++) {
      const previous = filteredData[i - 1];
      const current = filteredData[i];
      
      const change = current.prix - previous.prix;
      const isIncrease = change > 0;

      const priceChange: PriceChange = {
        id: current.id,
        previousPrice: previous.prix,
        currentPrice: current.prix,
        change: Math.abs(change),
        date: current.date_creation,
        isIncrease
      };

      changes.push(priceChange);

      if (isIncrease) {
        increasesList.push(priceChange);
      } else {
        decreasesList.push(priceChange);
      }
    }

    setPriceChanges(changes);
    setIncreases(increasesList);
    setDecreases(decreasesList);
  };

  const filterDataByTime = (data: HistoryItem[], filter: string) => {
    const now = new Date();
    let cutoffTime = new Date();

    switch (filter) {
      case '1m': cutoffTime.setMinutes(now.getMinutes() - 1); break;
      case '5m': cutoffTime.setMinutes(now.getMinutes() - 5); break;
      case '15m': cutoffTime.setMinutes(now.getMinutes() - 15); break;
      case '1h': cutoffTime.setHours(now.getHours() - 1); break;
      case '4h': cutoffTime.setHours(now.getHours() - 4); break;
      case '1d': cutoffTime.setDate(now.getDate() - 1); break;
      case '1w': cutoffTime.setDate(now.getDate() - 7); break;
      default: return data;
    }

    return data.filter(item => new Date(item.date_creation) >= cutoffTime);
  };

  const formatTime = (date: Date, filter: string) => {
    switch (filter) {
      case '1m':
      case '5m':
      case '15m':
        return date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
      case '1h':
      case '4h':
        return date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
      case '1d':
      case '1w':
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return date.toLocaleTimeString('fr-FR');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getPriceColor = () => {
    return priceChange >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getPriceChangeIcon = () => {
    return priceChange >= 0 ? 
      <TrendingUp className="w-4 h-4" /> : 
      <TrendingDown className="w-4 h-4" />;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    if (!payload.isNew) {
      return null;
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={priceChange >= 0 ? '#0ECB81' : '#F6465D'}
        stroke="#0B0E11"
        strokeWidth={2}
      />
    );
  };

  const timeFilters = [
    { value: '1m', label: '1 min' },
    { value: '5m', label: '5 min' },
    { value: '15m', label: '15 min' },
    { value: '1h', label: '1 heure' },
    { value: '4h', label: '4 heures' },
    { value: '1d', label: '1 jour' },
    { value: '1w', label: '1 semaine' }
  ];

  // Calculer le montant total pour l'achat
  const buyTotalAmount = lastPrice * buyQuantity;
  const clientOwnsStock = clientStocks.some(stock => stock.idStock === stockId);
  const clientStock = clientStocks.find(stock => stock.idStock === stockId);

  if (!stockId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Données non disponibles</h2>
          <Button onClick={() => navigate('/dashboard/stocklist')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux stocks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6">
      {/* Header avec prix en temps réel */}
      <div className="mb-8">
        <Button 
          onClick={() => navigate('/dashboard/stocklist')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux stocks
        </Button>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {stockName}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Historique des prix - {history.length} enregistrements
                <span className="text-xs text-green-500 ml-2">
                  Dernière mise à jour: {lastUpdateTime.toLocaleTimeString('fr-FR')}
                </span>
              </p>
            </div>
            
            {/* Prix en temps réel */}
            <div className="text-right">
              <div className="text-4xl font-bold text-foreground mb-2">
                {lastPrice.toFixed(2)} €
              </div>
              <div className={`flex items-center gap-2 justify-end ${getPriceColor()}`}>
                {getPriceChangeIcon()}
                <span className="font-semibold">
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
                <span className="text-sm">
                  ({priceChange >= 0 ? '+' : ''}{(lastPrice - (lastPrice / (1 + priceChange/100))).toFixed(2)} €)
                </span>
              </div>
            </div>
          </div>

          {/* Contrôles et Actions de trading */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-2">
              {timeFilters.map(filter => (
                <Button
                  key={filter.value}
                  variant={timeFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTimeFilter(filter.value);
                    processHistoryData(history);
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              {/* Dialog d'achat */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Acheter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Acheter {stockName}</DialogTitle>
                    <DialogDescription>
                      Achetez des actions de ce stock
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Prix actuel</Label>
                        <div className="text-2xl font-bold text-green-600">{lastPrice.toFixed(2)} €</div>
                      </div>
                      <div>
                        <Label>Votre solde</Label>
                        <div className="text-lg font-semibold flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          {clientSolde.toFixed(2)} €
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="buy-quantity">Quantité</Label>
                      <Input
                        id="buy-quantity"
                        type="number"
                        min="1"
                        value={buyQuantity}
                        onChange={(e) => setBuyQuantity(parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>Montant total:</span>
                        <span className={`font-bold ${buyTotalAmount > clientSolde ? 'text-red-500' : 'text-green-500'}`}>
                          {buyTotalAmount.toFixed(2)} €
                        </span>
                      </div>
                      {buyTotalAmount > clientSolde && (
                        <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Solde insuffisant
                        </div>
                      )}
                    </div>

                    {tradeMessage && (
                      <div className={`p-3 rounded-lg ${
                        tradeMessage.type === 'success' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
                      }`}>
                        {tradeMessage.message}
                      </div>
                    )}

                    <Button 
                      onClick={handleBuyStock}
                      disabled={tradingLoading || buyQuantity <= 0 || buyTotalAmount > clientSolde}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {tradingLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 mr-2" />
                      )}
                      {tradingLoading ? 'Achat en cours...' : `Acheter ${buyQuantity} action(s)`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Dialog de vente */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={!clientOwnsStock}
                    className={clientOwnsStock ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Vendre
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Vendre {stockName}</DialogTitle>
                    <DialogDescription>
                      Vendez vos actions de ce stock
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Prix actuel</Label>
                        <div className="text-2xl font-bold text-green-600">{lastPrice.toFixed(2)} €</div>
                      </div>
                      <div>
                        <Label>Actions possédées</Label>
                        <div className="text-lg font-semibold">
                          {clientStock?.quantite || 0} action(s)
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sell-quantity">Quantité à vendre</Label>
                      <Input
                        id="sell-quantity"
                        type="number"
                        min="1"
                        max={clientStock?.quantite || 0}
                        value={sellQuantity}
                        onChange={(e) => setSellQuantity(parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>Montant de vente:</span>
                        <span className="font-bold text-green-500">
                          {(lastPrice * sellQuantity).toFixed(2)} €
                        </span>
                      </div>
                    </div>

                    {tradeMessage && (
                      <div className={`p-3 rounded-lg ${
                        tradeMessage.type === 'success' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
                      }`}>
                        {tradeMessage.message}
                      </div>
                    )}

                    <Button 
                      onClick={handleSellStock}
                      disabled={tradingLoading || sellQuantity <= 0 || sellQuantity > (clientStock?.quantite || 0)}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {tradingLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <DollarSign className="w-4 h-4 mr-2" />
                      )}
                      {tradingLoading ? 'Vente en cours...' : `Vendre ${sellQuantity} action(s)`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={loadInitialData}
                disabled={loading}
              >
                <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser tout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique */}
        <div className="lg:col-span-2 bg-[#0B0E11] border border-[#2B3139] rounded-xl overflow-hidden shadow-2xl">
          {/* ... (le code du graphique reste identique) ... */}
        </div>

        {/* Listes des variations et informations trading */}
        <div className="space-y-6">
          {/* Informations de trading */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Trading
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Votre solde</span>
                <span className="font-bold text-green-500">{clientSolde.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Actions possédées</span>
                <span className="font-bold">{clientStock?.quantite || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valeur actuelle</span>
                <span className="font-bold text-blue-500">
                  {((clientStock?.quantite || 0) * lastPrice).toFixed(2)} €
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Augmentations */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <TrendingUp className="w-4 h-4" />
                Hausses ({increases.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto space-y-3">
                {increases.slice(-10).reverse().map((item) => (
                  <div key={item.id} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-green-400">
                        +{item.change.toFixed(2)} €
                      </span>
                      <span className="text-xs text-green-300">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <div className="text-sm text-green-300">
                      {item.previousPrice.toFixed(2)} → {item.currentPrice.toFixed(2)} €
                    </div>
                  </div>
                ))}
                {increases.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    Aucune hausse enregistrée
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Baisses */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <TrendingDown className="w-4 h-4" />
                Baisses ({decreases.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto space-y-3">
                {decreases.slice(-10).reverse().map((item) => (
                  <div key={item.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-red-400">
                        -{item.change.toFixed(2)} €
                      </span>
                      <span className="text-xs text-red-300">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <div className="text-sm text-red-300">
                      {item.previousPrice.toFixed(2)} → {item.currentPrice.toFixed(2)} €
                    </div>
                  </div>
                ))}
                {decreases.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    Aucune baisse enregistrée
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistiques résumées */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{increases.length}</div>
          <div className="text-sm text-muted-foreground">Hausses</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{decreases.length}</div>
          <div className="text-sm text-muted-foreground">Baisses</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{priceChanges.length}</div>
          <div className="text-sm text-muted-foreground">Changements totaux</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500">
            {lastPrice.toFixed(2)} €
          </div>
          <div className="text-sm text-muted-foreground">Prix actuel</div>
        </div>
      </div>
    </div>
  );
};

export default StockDetails;