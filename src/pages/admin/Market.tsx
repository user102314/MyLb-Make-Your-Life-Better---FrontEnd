// src/pages/StockListMarket.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Clock,
  Building,
  Activity,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// URLs des APIs
const PYTHON_API_BASE_URL = "http://localhost:8000";
const SPRING_API_BASE_URL = "http://localhost:9090/api/stocks";

interface Stock {
  idStock: number;
  nomStock: string;
  prixStock: number;
  etat: string;
  stockDisponible: number;
  stockRestant: number;
  idComponey: number;
  ownerId: number;
  dateCreation: string;
}

interface StockHistory {
  id: number;
  id_stock: number;
  prix: number;
  date_creation: string;
}

interface StockStats {
  stock_id: number;
  nom_stock: string;
  period_days: number;
  statistics: {
    total_entries: number;
    prix_min: number;
    prix_max: number;
    prix_moyen: number;
    date_debut: string;
    date_fin: string;
    dernier_prix: number;
    evolution_pourcentage: number;
    prix_debut: number;
    prix_fin: number;
  };
}

interface CompanyStocks {
  [key: number]: {
    nom_stock: string;
    history: StockHistory[];
    count: number;
  };
}

const StockListMarket: React.FC = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [allStocksHistory, setAllStocksHistory] = useState<CompanyStocks>({});
  const [stocksStats, setStocksStats] = useState<StockStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NAME_ASC');
  const [priceRange, setPriceRange] = useState<string>('ALL');

  // Charger toutes les données
  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des données...');
      
      // Récupérer les stocks depuis Spring Boot
      const stocksResponse = await fetch(SPRING_API_BASE_URL, {
        credentials: 'include'
      });
      
      if (stocksResponse.ok) {
        const stocksData = await stocksResponse.json();
        console.log('📊 Stocks Spring Boot:', stocksData);
        setStocks(stocksData);
        
        // Récupérer l'historique de tous les stocks depuis Python
        try {
          const historyResponse = await fetch(`${PYTHON_API_BASE_URL}/all-stocks-history?days=7&limit_per_stock=100`);
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            console.log('📈 Historique Python:', historyData);
            setAllStocksHistory(historyData.data || {});
          }
        } catch (historyError) {
          console.error('❌ Erreur historique Python:', historyError);
        }

        // Récupérer les statistiques pour chaque stock
        const statsPromises = stocksData.map((stock: Stock) => 
          fetch(`${PYTHON_API_BASE_URL}/stock-history/${stock.idStock}/stats?days=7`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => {
              console.warn(`⚠️ Impossible de récupérer les stats pour le stock ${stock.idStock}`);
              return null;
            })
        );

        const statsResults = await Promise.all(statsPromises);
        const validStats = statsResults.filter(Boolean);
        console.log('📊 Statistiques Python:', validStats);
        setStocksStats(validStats);
      } else {
        console.error('❌ Erreur récupération stocks Spring Boot');
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error('❌ Erreur générale:', err);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAllData();
      }, 10000); // Refresh toutes les 10 secondes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Obtenir les statistiques d'un stock
  const getStockStats = (stockId: number): StockStats | undefined => {
    return stocksStats.find(stats => stats.stock_id === stockId);
  };

  // Obtenir l'historique d'un stock
  const getStockHistory = (stockId: number): StockHistory[] => {
    return allStocksHistory[stockId]?.history || [];
  };

  // Formater le prix
  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) return '0.00';
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur du prix
  const getPriceColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  // Obtenir l'icône de tendance
  const getTrendIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="w-4 h-4" /> : 
      <TrendingDown className="w-4 h-4" />;
  };

  // Filtrer et trier les stocks
  const getFilteredStocks = () => {
    let filtered = [...stocks];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(stock =>
        stock.nomStock.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(stock => stock.etat === statusFilter);
    }

    // Filtre par fourchette de prix
    if (priceRange !== 'ALL') {
      filtered = filtered.filter(stock => {
        const price = stock.prixStock || 0;
        switch (priceRange) {
          case 'UNDER_10':
            return price < 10;
          case '10_50':
            return price >= 10 && price <= 50;
          case '50_100':
            return price > 50 && price <= 100;
          case 'OVER_100':
            return price > 100;
          default:
            return true;
        }
      });
    }

    // Tri
    filtered.sort((a, b) => {
      const statsA = getStockStats(a.idStock);
      const statsB = getStockStats(b.idStock);
      
      switch (sortBy) {
        case 'NAME_ASC':
          return a.nomStock.localeCompare(b.nomStock);
        case 'NAME_DESC':
          return b.nomStock.localeCompare(a.nomStock);
        case 'PRICE_ASC':
          return (a.prixStock || 0) - (b.prixStock || 0);
        case 'PRICE_DESC':
          return (b.prixStock || 0) - (a.prixStock || 0);
        case 'CHANGE_ASC':
          return (statsA?.statistics.evolution_pourcentage || 0) - (statsB?.statistics.evolution_pourcentage || 0);
        case 'CHANGE_DESC':
          return (statsB?.statistics.evolution_pourcentage || 0) - (statsA?.statistics.evolution_pourcentage || 0);
        case 'VOLUME_ASC':
          return (a.stockDisponible || 0) - (b.stockDisponible || 0);
        case 'VOLUME_DESC':
          return (b.stockDisponible || 0) - (a.stockDisponible || 0);
        default:
          return a.nomStock.localeCompare(b.nomStock);
      }
    });

    return filtered;
  };

  // Calculer les statistiques globales
  const calculateGlobalStats = () => {
    const totalStocks = stocks.length;
    const activeStocks = stocks.filter(s => s.etat === 'ACTIVE').length;
    const totalValue = stocks.reduce((sum, stock) => sum + (stock.prixStock || 0), 0);
    const avgPrice = totalStocks > 0 ? totalValue / totalStocks : 0;
    
    const totalChange = stocksStats.reduce((sum, stats) => 
      sum + (stats.statistics.evolution_pourcentage || 0), 0
    );
    const avgChange = stocksStats.length > 0 ? totalChange / stocksStats.length : 0;

    return {
      totalStocks,
      activeStocks,
      totalValue,
      avgPrice,
      avgChange
    };
  };

  const globalStats = calculateGlobalStats();
  const filteredStocks = getFilteredStocks();

  if (loading && stocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des stocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Marché des Stocks</h1>
          <p className="text-slate-300">Surveillez tous vos stocks en temps réel</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Statistiques et Filtres */}
          <div className="space-y-6">
            {/* Statistiques Globales */}
            <Card className="bg-gradient-to-br from-blue-600 to-purple-700 border-0 text-white shadow-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 mb-2">
                      Marché Global
                    </Badge>
                    <p className="text-blue-200 text-sm">Performance Totale</p>
                  </div>
                  <BarChart3 className="w-6 h-6 text-white/80" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Total Stocks</span>
                    <span className="text-white font-bold">{globalStats.totalStocks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Stocks Actifs</span>
                    <span className="text-green-400 font-bold">{globalStats.activeStocks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Prix Moyen</span>
                    <span className="text-white font-bold">{formatPrice(globalStats.avgPrice)} €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Change Moyen</span>
                    <span className={`font-bold ${getPriceColor(globalStats.avgChange)}`}>
                      {globalStats.avgChange >= 0 ? '+' : ''}{globalStats.avgChange.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/20">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-200">Dernière mise à jour</span>
                    <span className="text-white/80">{lastUpdate.toLocaleTimeString('fr-FR')}</span>
                  </div>
                </div>
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
                      placeholder="Rechercher un stock..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
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
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="INACTIVE">Inactif</SelectItem>
                      <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fourchette de prix */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Fourchette de prix</Label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous les prix</SelectItem>
                      <SelectItem value="UNDER_10">Moins de 10€</SelectItem>
                      <SelectItem value="10_50">10€ - 50€</SelectItem>
                      <SelectItem value="50_100">50€ - 100€</SelectItem>
                      <SelectItem value="OVER_100">Plus de 100€</SelectItem>
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
                      <SelectItem value="NAME_ASC">Nom (A-Z)</SelectItem>
                      <SelectItem value="NAME_DESC">Nom (Z-A)</SelectItem>
                      <SelectItem value="PRICE_ASC">Prix (Croissant)</SelectItem>
                      <SelectItem value="PRICE_DESC">Prix (Décroissant)</SelectItem>
                      <SelectItem value="CHANGE_ASC">Change (Croissant)</SelectItem>
                      <SelectItem value="CHANGE_DESC">Change (Décroissant)</SelectItem>
                      <SelectItem value="VOLUME_ASC">Volume (Croissant)</SelectItem>
                      <SelectItem value="VOLUME_DESC">Volume (Décroissant)</SelectItem>
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
                      setStatusFilter('ALL');
                      setPriceRange('ALL');
                      setSortBy('NAME_ASC');
                    }}
                  >
                    Réinitialiser
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={fetchAllData}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contrôles Auto-refresh */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Contrôles Temps Réel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Auto-refresh</Label>
                    <Button
                      variant={autoRefresh ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                      {autoRefresh ? 'Activé' : 'Désactivé'}
                    </Button>
                  </div>
                  <div className="text-xs text-slate-400">
                    {autoRefresh 
                      ? 'Mise à jour automatique toutes les 10 secondes' 
                      : 'Mise à jour manuelle uniquement'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="all" className="text-slate-300 data-[state=active]:bg-slate-700">
                  <Building className="w-4 h-4 mr-2" />
                  Tous les Stocks ({filteredStocks.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-slate-300 data-[state=active]:bg-slate-700">
                  <Activity className="w-4 h-4 mr-2" />
                  Stocks Actifs ({stocks.filter(s => s.etat === 'ACTIVE').length})
                </TabsTrigger>
                <TabsTrigger value="gainers" className="text-slate-300 data-[state=active]:bg-slate-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Performants ({stocksStats.filter(s => s.statistics.evolution_pourcentage > 0).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredStocks.length === 0 ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="text-center py-12">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                      <h3 className="text-xl font-semibold text-white mb-2">Aucun stock trouvé</h3>
                      <p className="text-slate-400">
                        Aucun stock ne correspond à vos critères de recherche
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredStocks.map((stock) => {
                      const stats = getStockStats(stock.idStock);
                      const history = getStockHistory(stock.idStock);
                      const change = stats?.statistics?.evolution_pourcentage || 0;
                      const lastPrice = stock.prixStock || 0;
                      const minPrice = stats?.statistics?.prix_min || lastPrice;
                      const maxPrice = stats?.statistics?.prix_max || lastPrice;

                      return (
                        <Card 
                          key={stock.idStock} 
                          className="bg-slate-800 border-slate-700 hover:border-slate-500 transition-all duration-300 cursor-pointer hover:shadow-xl"
                          onClick={() => navigate('/dashboard/stock-details', { 
                            state: { 
                              stockId: stock.idStock, 
                              stockName: stock.nomStock 
                            } 
                          })}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-white text-lg">
                                  {stock.nomStock}
                                </CardTitle>
                                <CardDescription className="text-slate-400 flex items-center gap-2 mt-1">
                                  <Building className="w-3 h-3" />
                                  Company #{stock.idComponey || 'N/A'}
                                </CardDescription>
                              </div>
                              <Badge variant={
                                stock.etat === 'ACTIVE' ? 'default' :
                                stock.etat === 'INACTIVE' ? 'secondary' : 'destructive'
                              }>
                                {stock.etat === 'ACTIVE' ? 'Actif' :
                                 stock.etat === 'INACTIVE' ? 'Inactif' : 'Suspendu'}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Prix et Change */}
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white mb-1">
                                {formatPrice(lastPrice)} €
                              </div>
                              <div className={`flex items-center justify-center gap-1 ${getPriceColor(change)}`}>
                                {getTrendIcon(change)}
                                <span className="font-semibold">
                                  {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                                </span>
                              </div>
                            </div>

                            {/* Statistiques */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                                <div className="text-green-400 font-bold">
                                  {formatPrice(maxPrice)}
                                </div>
                                <div className="text-slate-400 text-xs">Max</div>
                              </div>
                              <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                                <div className="text-red-400 font-bold">
                                  {formatPrice(minPrice)}
                                </div>
                                <div className="text-slate-400 text-xs">Min</div>
                              </div>
                            </div>

                            {/* Volume et Historique */}
                            <div className="flex justify-between items-center text-xs text-slate-400">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                Volume: {stock.stockDisponible || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {history.length} trades
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="pt-0">
                            <Button 
                              variant="outline" 
                              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/dashboard/stock-details', { 
                                  state: { 
                                    stockId: stock.idStock, 
                                    stockName: stock.nomStock 
                                  } 
                                });
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir Détails
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredStocks
                    .filter(stock => stock.etat === 'ACTIVE')
                    .map((stock) => {
                      const stats = getStockStats(stock.idStock);
                      const change = stats?.statistics?.evolution_pourcentage || 0;
                      
                      return (
                        <Card key={stock.idStock} className="bg-slate-800 border-slate-700">
                          <CardHeader>
                            <CardTitle className="text-white">{stock.nomStock}</CardTitle>
                            <CardDescription className="text-slate-400">
                              Company #{stock.idComponey}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-400 mb-2">
                              {formatPrice(stock.prixStock)} €
                            </div>
                            <div className={`flex items-center gap-1 ${getPriceColor(change)}`}>
                              {getTrendIcon(change)}
                              <span className="font-semibold">
                                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>

              <TabsContent value="gainers">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredStocks
                    .filter(stock => {
                      const stats = getStockStats(stock.idStock);
                      return stats && stats.statistics.evolution_pourcentage > 0;
                    })
                    .sort((a, b) => {
                      const statsA = getStockStats(a.idStock);
                      const statsB = getStockStats(b.idStock);
                      return (statsB?.statistics.evolution_pourcentage || 0) - (statsA?.statistics.evolution_pourcentage || 0);
                    })
                    .map((stock) => {
                      const stats = getStockStats(stock.idStock);
                      const change = stats?.statistics.evolution_pourcentage || 0;
                      
                      return (
                        <Card key={stock.idStock} className="bg-slate-800 border-slate-700">
                          <CardHeader>
                            <CardTitle className="text-white">{stock.nomStock}</CardTitle>
                            <CardDescription className="text-slate-400">
                              Company #{stock.idComponey}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-400 mb-2">
                              {formatPrice(stock.prixStock)} €
                            </div>
                            <div className="flex items-center gap-1 text-green-400">
                              <TrendingUp className="w-4 h-4" />
                              <span className="font-semibold">
                                +{change.toFixed(2)}%
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>
            </Tabs>

            {/* Résumé des performances */}
            {stocksStats.length > 0 && (
              <Card className="bg-slate-800 border-slate-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-white">Performances du Marché</CardTitle>
                  <CardDescription className="text-slate-400">
                    Aperçu des tendances sur les 7 derniers jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-500">
                        {stocksStats.filter(s => s.statistics.evolution_pourcentage > 0).length}
                      </div>
                      <div className="text-slate-400 text-sm">Stocks en hausse</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-red-500">
                        {stocksStats.filter(s => s.statistics.evolution_pourcentage < 0).length}
                      </div>
                      <div className="text-slate-400 text-sm">Stocks en baisse</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">
                        {stocksStats.length}
                      </div>
                      <div className="text-slate-400 text-sm">Stocks suivis</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-500">
                        {stocksStats.length > 0 ? Math.max(...stocksStats.map(s => s.statistics.evolution_pourcentage)).toFixed(2) : '0.00'}%
                      </div>
                      <div className="text-slate-400 text-sm">Meilleure performance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockListMarket;